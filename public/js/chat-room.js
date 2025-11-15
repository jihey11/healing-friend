// Firebase 인증 가져오기
import { auth } from './config.js';

// Firebase 인증 함수 가져오기
function getFirebaseAuth() {
  if (window.firebaseModules) {
    return window.firebaseModules;
  }
  return null;
}

// 채팅방 관리 클래스
class ChatRoomManager {
  constructor() {
    this.currentRoom = null;
    this.typingTimeout = null;
    this.db = null;
    this.initialized = false;
    this.userId = null;
    this.nickname = null;
    this.userProfile = null;
    
    // Firebase 인증 사용자 정보 가져오기
    this.loadUserInfo();
  }

  loadUserInfo() {
    try {
      // Firebase 인증에서 현재 사용자 가져오기
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth && auth && auth.currentUser) {
        const currentUser = auth.currentUser;
        this.userId = currentUser.uid;
        
        // 사용자별 닉네임과 프로필 가져오기 (localStorage에 사용자 ID 포함)
        const userNicknameKey = `chatNickname_${this.userId}`;
        const userProfileKey = `chatUserProfile_${this.userId}`;
        
        this.nickname = localStorage.getItem(userNicknameKey);
        this.userProfile = localStorage.getItem(userProfileKey) || currentUser.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
        
        // 닉네임이 없으면 이메일이나 displayName 사용
        if (!this.nickname) {
          this.nickname = currentUser.displayName || currentUser.email?.split('@')[0] || '익명';
        }
      } else {
        // 로그인하지 않은 경우 기본값
        this.userId = null;
        this.nickname = localStorage.getItem("chatNickname");
        this.userProfile = localStorage.getItem("chatUserProfile") || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      // 기본값 사용
      this.nickname = localStorage.getItem("chatNickname");
      this.userProfile = localStorage.getItem("chatUserProfile") || "https://cdn.openai.com/chat-plugins/images/person-placeholder.png";
    }
  }

  async initialize() {
    if (this.initialized && this.db) {
      console.log('채팅 Firebase 이미 초기화됨');
      return true;
    }
    
    try {
      // window.ENV가 로드될 때까지 최대 5초 대기 (모바일 환경 대응)
      let envWaitCount = 0;
      const maxEnvWait = 10; // 10 * 500ms = 5초
      
      while (!window.ENV && envWaitCount < maxEnvWait) {
        console.log(`window.ENV 로드 대기 중... (${envWaitCount + 1}/${maxEnvWait})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        envWaitCount++;
      }
      
      // window.ENV가 없으면 실패
      if (!window.ENV) {
        console.error('window.ENV 로드 시간 초과');
        return false;
      }
      
      // FIREBASE_DATABASE_URL이 없으면 즉시 자동 생성 (객체 정의 직후와 동일한 로직)
      if (!window.ENV.FIREBASE_DATABASE_URL && window.ENV.FIREBASE_PROJECT_ID) {
        window.ENV.FIREBASE_DATABASE_URL = `https://${window.ENV.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`;
        console.log('✅ FIREBASE_DATABASE_URL 자동 생성:', window.ENV.FIREBASE_DATABASE_URL);
      }
      
      // Firebase 설정 확인
      if (!window.ENV.FIREBASE_API_KEY) {
        console.warn('Firebase 설정이 없습니다. 채팅 기능을 사용할 수 없습니다.');
        return false;
      }
      
      // Firebase 모듈이 로드될 때까지 최대 10초 대기
      let waitCount = 0;
      const maxWait = 20; // 20 * 500ms = 10초
      
      while (!window.firebaseModules && waitCount < maxWait) {
        console.log(`Firebase 모듈 로드 대기 중... (${waitCount + 1}/${maxWait})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        waitCount++;
      }
      
      // Firebase 모듈이 여전히 없으면 실패
      if (!window.firebaseModules) {
        console.error('Firebase 모듈 로드 시간 초과');
        return false;
      }
      
      const { getApp, getApps, initializeApp, getDatabase } = window.firebaseModules;
      
      // 기존 Firebase 앱이 있는지 확인
      let app;
      try {
        // 이미 초기화된 앱이 있는지 확인
        const getAppsFunc = getApps || (() => []);
        const existingApps = getAppsFunc();
        
        if (existingApps.length > 0) {
          // 기존 앱 재사용
          app = existingApps[0];
          console.log('✅ 기존 Firebase 앱 재사용');
        } else {
          // 앱이 없으면 새로 생성 (databaseURL 포함)
          // FIREBASE_DATABASE_URL이 없으면 자동으로 생성 (이미 위에서 처리했지만 안전장치)
          const databaseURL = window.ENV.FIREBASE_DATABASE_URL || 
            (window.ENV.FIREBASE_PROJECT_ID ? `https://${window.ENV.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/` : null);
          
          if (!databaseURL) {
            console.error('FIREBASE_DATABASE_URL을 생성할 수 없습니다. FIREBASE_PROJECT_ID가 필요합니다.');
            return false;
          }
          
          console.log('📝 Firebase 앱 생성 시도:', {
            hasApiKey: !!window.ENV.FIREBASE_API_KEY,
            hasDatabaseURL: !!databaseURL,
            databaseURL: databaseURL
          });
          
          const firebaseConfig = {
            apiKey: window.ENV.FIREBASE_API_KEY,
            authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
            projectId: window.ENV.FIREBASE_PROJECT_ID,
            storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.ENV.FIREBASE_APP_ID,
            databaseURL: databaseURL
          };
          
          console.log('Firebase Config:', { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? '설정됨' : '누락' });
          app = initializeApp(firebaseConfig, '[DEFAULT]');
          console.log('✅ 새 Firebase 앱 생성 (Realtime Database 포함)');
        }
        
        this.db = getDatabase(app);
        console.log('✅ 채팅 Firebase Realtime Database 초기화 성공');
      } catch (error) {
        // 중복 앱 오류인 경우 기존 앱 재사용 시도
        if (error.code === 'app/duplicate-app' || error.message?.includes('already exists')) {
          try {
            const getAppFunc = getApp || (() => null);
            app = getAppFunc('[DEFAULT]');
            if (app) {
              this.db = getDatabase(app);
              console.log('✅ 중복 앱 오류 해결: 기존 앱 재사용');
            } else {
              throw new Error('기존 앱을 찾을 수 없습니다');
            }
          } catch (retryError) {
            console.error('❌ Firebase 앱 재사용 실패:', retryError);
            return false;
          }
        } else {
          console.error('❌ Firebase 앱 초기화 오류:', error);
          return false;
        }
      }

      this.setupEventListeners();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ 채팅 초기화 실패:', error);
      return false;
    }
  }

  setupEventListeners() {
    // 메시지 입력 엔터 키
    const messageInput = document.getElementById("chat-message-input");
    if (messageInput) {
      // 기존 이벤트 리스너 제거 후 새로 등록 (중복 방지)
      const newKeyupHandler = (e) => {
        if (e.key === "Enter") this.sendMessage();
      };
      const newInputHandler = (e) => {
        const charCounter = document.getElementById("chat-char-counter");
        if (charCounter) {
          const currentLength = e.target.value.length;
          charCounter.textContent = `${currentLength}/1000`;
          charCounter.style.color = currentLength > 1000 ? "#ff4444" : "#999";
        }
      };
      
      // 기존 핸들러 제거
      messageInput.removeEventListener("keyup", this._keyupHandler);
      messageInput.removeEventListener("input", this._inputHandler);
      
      // 새 핸들러 저장 및 등록
      this._keyupHandler = newKeyupHandler;
      this._inputHandler = newInputHandler;
      messageInput.addEventListener("keyup", this._keyupHandler);
      messageInput.addEventListener("input", this._inputHandler);
    }

    // 비밀번호 체크박스 이벤트
    const passwordCheckbox = document.getElementById("chat-use-password");
    const passwordInputGroup = document.getElementById("password-input-group");
    if (passwordCheckbox && passwordInputGroup) {
      // 기존 핸들러 제거
      passwordCheckbox.removeEventListener("change", this._passwordCheckboxHandler);
      
      // 새 핸들러 생성 및 저장
      this._passwordCheckboxHandler = (e) => {
        if (e.target.checked) {
          passwordInputGroup.classList.remove("hidden");
        } else {
          passwordInputGroup.classList.add("hidden");
          const passwordInput = document.getElementById("chat-new-room-password");
          if (passwordInput) passwordInput.value = "";
        }
      };
      
      passwordCheckbox.addEventListener("change", this._passwordCheckboxHandler);
    }

    // 검색 기능
    const searchInput = document.getElementById("chat-search-room");
    if (searchInput) {
      // 기존 핸들러 제거
      searchInput.removeEventListener("input", this._searchInputHandler);
      
      // 새 핸들러 생성 및 저장
      this._searchInputHandler = () => this.loadRoomList();
      searchInput.addEventListener("input", this._searchInputHandler);
    }

    // 알림 권한 요청
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }

  async initUI() {
    // 사용자 정보 다시 로드 (로그인 상태 변경 시)
    this.loadUserInfo();
    
    if (!this.db) {
      const initialized = await this.initialize();
      if (!initialized) {
        const roomSelection = document.getElementById("chat-room-selection");
        if (roomSelection) {
          roomSelection.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
              <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
                온라인 채팅 기능을 사용하려면<br>Firebase 설정이 필요합니다.
              </p>
              <p style="font-size: 14px; color: #999; margin-bottom: 30px;">
                현재는 데모 모드로 실행 중입니다.<br>
                다른 기능들은 정상적으로 사용할 수 있습니다.
              </p>
              <button onclick="location.reload()" style="padding: 12px 24px; font-size: 16px; background: #00CED1; color: white; border: none; border-radius: 8px; cursor: pointer;">
                페이지 새로고침
              </button>
            </div>
          `;
        }
        return;
      }
    }

    // Firebase 인증 사용자가 있으면 닉네임 입력 건너뛰기
    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth && auth && auth.currentUser) {
      // 로그인된 사용자는 자동으로 닉네임 설정됨
      document.getElementById("chat-nickname-section")?.classList.add("hidden");
      document.getElementById("chat-room-selection")?.classList.remove("hidden");
      this.loadRoomList();

      // 저장된 채팅방 자동 입장 (사용자별로 저장)
      const savedRoomKey = this.userId ? `chatCurrentRoom_${this.userId}` : "chatCurrentRoom";
      const savedPasswordKey = this.userId ? `chatRoomPassword_${this.userId}` : "chatRoomPassword";
      const savedRoom = localStorage.getItem(savedRoomKey);
      const savedPassword = localStorage.getItem(savedPasswordKey);
      if (savedRoom && savedPassword) {
        this.enterRoom(savedRoom, savedPassword);
      }
    } else if (this.nickname) {
      // 로그인하지 않았지만 닉네임이 있는 경우
      document.getElementById("chat-nickname-section")?.classList.add("hidden");
      document.getElementById("chat-room-selection")?.classList.remove("hidden");
      this.loadRoomList();
    } else {
      // 닉네임 입력 필요
      document.getElementById("chat-nickname-section")?.classList.remove("hidden");
      document.getElementById("chat-room-selection")?.classList.add("hidden");
    }
  }

  saveNickname() {
    const input = document.getElementById("chat-nickname-input");
    const profileInput = document.getElementById("chat-profile-image-input");
    
    if (!input) return;
    
    const nicknameValue = input.value.trim();
    if (!nicknameValue) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    this.nickname = nicknameValue;
    
    // 사용자별로 닉네임 저장
    if (this.userId) {
      localStorage.setItem(`chatNickname_${this.userId}`, this.nickname);
    } else {
      localStorage.setItem("chatNickname", this.nickname);
    }

    if (profileInput?.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userProfile = e.target.result;
        // 사용자별로 프로필 저장
        if (this.userId) {
          localStorage.setItem(`chatUserProfile_${this.userId}`, this.userProfile);
        } else {
          localStorage.setItem("chatUserProfile", this.userProfile);
        }
        this.initUI();
      };
      reader.readAsDataURL(profileInput.files[0]);
    } else {
      this.initUI();
    }
  }

  showCreateRoomForm() {
    document.getElementById("chat-room-selection")?.classList.add("hidden");
    document.getElementById("chat-create-room-form")?.classList.remove("hidden");
  }

  cancelCreateRoom() {
    document.getElementById("chat-create-room-form")?.classList.add("hidden");
    document.getElementById("chat-room-selection")?.classList.remove("hidden");
  }

  async createRoom() {
    if (!this.db) {
      const initialized = await this.initialize();
      if (!initialized) {
        showToast("온라인 채팅 기능을 사용하려면 Firebase 설정이 필요합니다.", "error");
        return;
      }
    }

    const roomName = document.getElementById("chat-new-room-name")?.value.trim();
    const usePassword = document.getElementById("chat-use-password")?.checked || false;
    const password = usePassword ? document.getElementById("chat-new-room-password")?.value.trim() : "";
    const imageInput = document.getElementById("chat-new-room-image")?.files[0];

    if (!roomName) {
      alert("방 이름을 입력해주세요.");
      return;
    }

    if (usePassword && !password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    // 사용자 정보 다시 로드 (최신 정보 사용)
    this.loadUserInfo();

    const { ref, set } = window.firebaseModules;

    const saveRoomData = (imageUrl) => {
      const roomsRef = ref(this.db, `rooms/${roomName}`);
      
      // 비밀번호가 있는 경우에만 저장
      if (usePassword && password) {
        const roomPasswordsRef = ref(this.db, `roomPasswords/${roomName}`);
        set(roomPasswordsRef, password);
      }
      
      set(roomsRef, {
        image: imageUrl,
        creator: this.nickname,
        hasPassword: usePassword && password ? true : false
      });
      
      // 입력 필드 초기화
      document.getElementById("chat-new-room-name").value = "";
      document.getElementById("chat-new-room-password").value = "";
      document.getElementById("chat-use-password").checked = false;
      document.getElementById("chat-new-room-image").value = "";
      document.getElementById("password-input-group")?.classList.add("hidden");
      
      this.cancelCreateRoom();
      this.loadRoomList();
    };

    if (imageInput) {
      const reader = new FileReader();
      reader.onload = (e) => saveRoomData(e.target.result);
      reader.readAsDataURL(imageInput);
    } else {
      // 이미지를 업로드하지 않았을 경우 사용자 프로필 사진 사용
      // 사용자 프로필이 없으면 기본 placeholder 사용
      let defaultImage = this.userProfile;
      
      // 프로필이 없거나 기본 placeholder인 경우 확인
      const defaultPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
      if (!defaultImage || defaultImage === "https://cdn.openai.com/chat-plugins/images/person-placeholder.png" || defaultImage.includes("person-placeholder")) {
        // Firebase 인증 사용자의 photoURL 확인
        const firebaseAuth = getFirebaseAuth();
        if (firebaseAuth && auth && auth.currentUser && auth.currentUser.photoURL) {
          defaultImage = auth.currentUser.photoURL;
        } else {
          defaultImage = defaultPlaceholder;
        }
      }
      
      saveRoomData(defaultImage);
    }
  }

  async loadRoomList() {
    if (!this.db) return;

    const container = document.getElementById("chat-room-list-container");
    const sidebarContainer = document.getElementById("chat-sidebar-room-list");
    
    // 기존 리스너 제거 (중복 방지)
    if (this._roomsListener) {
      const { ref, off } = window.firebaseModules;
      const roomsRef = ref(this.db, "rooms");
      off(roomsRef, this._roomsListener);
    }

    const filter = document.getElementById("chat-search-room")?.value.toLowerCase() || "";

    const { ref, onValue } = window.firebaseModules;
    const roomsRef = ref(this.db, "rooms");
    
    // 리스너 함수 정의
    const roomsListener = (snapshot) => {
      const rooms = snapshot.val();
      
      // 컨테이너 초기화
      if (container) container.innerHTML = "";
      if (sidebarContainer) sidebarContainer.innerHTML = "";
      
      if (!rooms) return;

      Object.entries(rooms).forEach(([roomId, roomData]) => {
        if (!roomId.toLowerCase().includes(filter)) return;

        // 메인 채팅방 목록
        if (container) {
          const div = document.createElement("div");
          div.className = "room-item";
          div.onclick = (e) => {
            if (e.target.classList.contains("delete-button")) return;
            this.enterRoom(roomId);
          };

          const img = document.createElement("img");
          const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
          img.src = roomData.image || placeholder;
          div.appendChild(img);

          const info = document.createElement("div");
          info.className = "room-info";
          const name = document.createElement("div");
          name.className = "room-name";
          name.innerText = roomId;
          info.appendChild(name);
          div.appendChild(info);

          if (roomData.creator === this.nickname) {
            const delBtn = document.createElement("button");
            delBtn.innerText = "🗑";
            delBtn.className = "delete-button";
            delBtn.onclick = (e) => {
              e.stopPropagation();
              this.deleteRoom(roomId);
            };
            div.appendChild(delBtn);
          }

          container.appendChild(div);
        }

        // 사이드바 채팅방 목록
        if (sidebarContainer) {
          const sidebarItem = document.createElement("div");
          sidebarItem.className = "sidebar-room-item";
          sidebarItem.onclick = () => this.enterRoom(roomId);

          const img = document.createElement("img");
          const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
          img.src = roomData.image || placeholder;
          sidebarItem.appendChild(img);

          const name = document.createElement("div");
          name.className = "sidebar-room-name";
          name.innerText = roomId;
          sidebarItem.appendChild(name);

          sidebarContainer.appendChild(sidebarItem);
        }
      });
    };
    
    // 리스너 저장 및 등록
    this._roomsListener = roomsListener;
    onValue(roomsRef, roomsListener);
  }

  async enterRoom(roomId, directPassword = null) {
    if (!this.db) {
      const initialized = await this.initialize();
      if (!initialized) {
        showToast("온라인 채팅 기능을 사용하려면 Firebase 설정이 필요합니다.", "error");
        return;
      }
    }

    const { ref, onValue, set, push, onDisconnect } = window.firebaseModules;
    const roomsRef = ref(this.db, `rooms/${roomId}`);
    const passwordRef = ref(this.db, `roomPasswords/${roomId}`);
    
    // 방 정보 확인
    onValue(roomsRef, (roomSnapshot) => {
      const roomData = roomSnapshot.val();
      const hasPassword = roomData?.hasPassword || false;
      
      // 비밀번호가 있는 경우에만 확인
      if (hasPassword) {
        const inputPassword = directPassword ?? prompt(`'${roomId}' 비밀번호를 입력하세요:`);
        if (inputPassword === null) return;
        
        onValue(passwordRef, (passwordSnapshot) => {
          const correctPassword = passwordSnapshot.val();
          if (inputPassword !== correctPassword) {
            alert("비밀번호가 틀렸습니다!");
            return;
          }
          this.proceedEnterRoom(roomId, roomData);
        }, { onlyOnce: true });
      } else {
        // 비밀번호가 없는 경우 바로 입장
        this.proceedEnterRoom(roomId, roomData);
      }
    }, { onlyOnce: true });
  }

  proceedEnterRoom(roomId, roomData) {
    if (!this.db) return;
    
    const { ref, set, push, onDisconnect, onValue } = window.firebaseModules;

    if (this.currentRoom) {
      const messagesRef = ref(this.db, `rooms/${this.currentRoom}/messages`);
      const { off } = window.firebaseModules;
      off(messagesRef);
    }

    this.currentRoom = roomId;
    localStorage.setItem("chatCurrentRoom", roomId);

    const activeUsersRef = ref(this.db, `rooms/${roomId}/activeUsers/${this.nickname}`);
    onDisconnect(activeUsersRef).remove();
    set(activeUsersRef, {
      nickname: this.nickname,
      userId: this.userId || 'anonymous',
      timestamp: Date.now()
    });

    document.getElementById("chat-room-selection")?.classList.add("hidden");
    document.getElementById("chat-section")?.classList.remove("hidden");
    document.getElementById("chat-room-title").innerText = roomId;
    
    // 채팅방 데이터 가져오기
    const roomDataRef = ref(this.db, `rooms/${roomId}`);
    onValue(roomDataRef, (roomSnapshot) => {
      const roomData = roomSnapshot.val();
      if (roomData && roomData.image) {
        document.getElementById("chat-room-profile").src = roomData.image;
      } else {
        document.getElementById("chat-room-profile").src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
      }
    }, { onlyOnce: true });
    
    // 사이드바에서 현재 채팅방 하이라이트
    const sidebarItems = document.querySelectorAll(".sidebar-room-item");
    sidebarItems.forEach(item => {
      item.classList.remove("active");
      if (item.querySelector(".sidebar-room-name")?.innerText === roomId) {
        item.classList.add("active");
      }
    });

    const messagesRef = ref(this.db, `rooms/${roomId}/messages`);
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
      nickname: "시스템",
      userProfile: "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
      text: `${this.nickname}님이 입장했습니다.`,
      timestamp: Date.now(),
      userId: this.userId || 'anonymous'
    });

    this.listenForMessages();
    this.setupTypingStatus();
  }

  async listenForMessages() {
    if (!this.db || !this.currentRoom) return;

    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;
    
    chatBox.innerHTML = "";
    let lastDate = null;

    const { ref, onValue, off, set } = window.firebaseModules;
    const messageRef = ref(this.db, `rooms/${this.currentRoom}/messages`);
    off(messageRef);

    onValue(messageRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const msg = childSnapshot.val();
        if (!msg) return;

        // 날짜 구분선 추가
        const messageDate = new Date(msg.timestamp);
        const dateString = messageDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        if (lastDate !== dateString) {
          const dateDivider = document.createElement("div");
          dateDivider.className = "date-divider";
          const span = document.createElement("span");
          span.innerText = dateString;
          dateDivider.appendChild(span);
          chatBox.appendChild(dateDivider);
          lastDate = dateString;
        }

        // 메시지 컨테이너 생성
        const messageContainer = document.createElement("div");
        messageContainer.className = "message-container";

        const div = document.createElement("div");
        const isSystem = msg.nickname === "시스템";
        // 사용자 ID로 비교 (더 정확함)
        const isOwn = (msg.userId && msg.userId === this.userId) || (!msg.userId && msg.nickname === this.nickname);
        div.className = `message ${isSystem ? 'system' : (isOwn ? 'own' : 'other')}`;

        // 프로필 사진 (시스템 메시지가 아닌 경우만)
        if (!isSystem) {
          const profileImg = document.createElement("img");
          profileImg.className = "message-profile";
          const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ddd'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='40' fill='%23999'%3E👤%3C/text%3E%3C/svg%3E";
          profileImg.src = isOwn ? this.userProfile : (msg.userProfile || placeholder);
          div.appendChild(profileImg);
        }

        // 메시지 내용 컨테이너
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";

        // 이름 표시 (상대방 메시지만, 시스템 메시지 제외)
        if (!isOwn && !isSystem) {
          const name = document.createElement("div");
          name.className = "name";
          name.innerText = msg.nickname;
          messageContent.appendChild(name);
        }

        // 메시지 말풍선
        const messageBubble = document.createElement("div");
        messageBubble.className = "message-bubble";

        if (msg.deleted) {
          const text = document.createElement("div");
          text.innerText = "🚫 삭제된 메시지입니다.";
          text.style.fontStyle = "italic";
          text.style.color = msg.nickname === this.nickname ? "rgba(255, 255, 255, 0.7)" : "#888";
          messageBubble.appendChild(text);
        } else {
          if (msg.text) {
            const text = document.createElement("div");
            text.innerText = msg.text;
            messageBubble.appendChild(text);
          }

          if (msg.fileData && msg.mediaType) {
            const media = document.createElement(msg.mediaType === "image" ? "img" : "video");
            media.src = msg.fileData;
            media.controls = true;
            media.style.maxWidth = "200px";
            media.style.borderRadius = "12px";
            messageBubble.appendChild(media);
          }

          // 시간 표시
          const timeDiv = document.createElement("div");
          timeDiv.className = "message-time";
          timeDiv.innerText = messageDate.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          messageBubble.appendChild(timeDiv);

          // 내 메시지인 경우 편집/삭제 버튼 (시스템 메시지 제외)
          if (isOwn && !isSystem) {
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "4px";
            buttonContainer.style.marginTop = "4px";

            const editBtn = document.createElement("button");
            editBtn.innerText = "✎";
            editBtn.className = "icon-button";
            editBtn.style.fontSize = "12px";
            editBtn.style.padding = "4px 8px";
            editBtn.onclick = () => {
              const newText = prompt("수정할 메시지를 입력하세요", msg.text);
              if (newText !== null && newText.trim() !== "") {
                const { ref, set } = window.firebaseModules;
                const messageRef = ref(this.db, `rooms/${this.currentRoom}/messages/${childSnapshot.key}`);
                set(messageRef, { ...msg, text: newText.trim() });
              }
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "🗑";
            deleteBtn.className = "icon-button";
            deleteBtn.style.fontSize = "12px";
            deleteBtn.style.padding = "4px 8px";
            deleteBtn.onclick = () => {
              if (confirm("정말 이 메시지를 삭제하시겠습니까?")) {
                const { ref, set } = window.firebaseModules;
                const messageRef = ref(this.db, `rooms/${this.currentRoom}/messages/${childSnapshot.key}`);
                set(messageRef, { ...msg, deleted: true, text: "삭제된 메시지입니다." });
              }
            };

            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(deleteBtn);
            messageBubble.appendChild(buttonContainer);
          }
        }

        messageContent.appendChild(messageBubble);
        div.appendChild(messageContent);
        messageContainer.appendChild(div);
        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // 사용자 ID 기반으로 읽음 표시 저장
        const readReceiptsKey = this.userId || this.nickname;
        const readReceiptsRef = ref(this.db, `rooms/${this.currentRoom}/readReceipts/${readReceiptsKey}`);
        set(readReceiptsRef, childSnapshot.key);
      });
    });
  }

  setupTypingStatus() {
    if (!this.db || !this.currentRoom) return;

    const input = document.getElementById("chat-message-input");
    if (!input) return;

    input.addEventListener("input", () => {
      const { ref, set, remove } = window.firebaseModules;
      const typingRef = ref(this.db, `rooms/${this.currentRoom}/typing/${this.nickname}`);
      set(typingRef, true);
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        remove(typingRef);
      }, 2000);
    });

    const { ref, onValue } = window.firebaseModules;
    const typingRef = ref(this.db, `rooms/${this.currentRoom}/typing`);
    onValue(typingRef, (snapshot) => {
      const typingUsers = snapshot.val();
      const others = typingUsers ? Object.keys(typingUsers).filter(name => name !== this.nickname) : [];
      const indicator = document.getElementById("chat-typing-indicator");
      if (indicator) {
        indicator.innerText = others.length > 0 ? `${others.join(", ")}님이 입력 중...` : "";
      }
    });
  }

  sendMessage() {
    if (!this.db || !this.currentRoom) return;

    const text = document.getElementById("chat-message-input")?.value.trim();
    const file = document.getElementById("chat-file-input")?.files[0];
    
    if (!text && !file) return;
    
    // 글자 수 제한 체크
    if (text && text.length > 1000) {
      alert("메시지는 1000자를 초과할 수 없습니다.");
      return;
    }

    const { ref, push, set, remove } = window.firebaseModules;
    const messagesRef = ref(this.db, `rooms/${this.currentRoom}/messages`);
    const messageRef = push(messagesRef);
    const timestamp = Date.now();

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target.result;
        const mediaType = file.type.startsWith("image/") ? "image" : "video";
        set(messageRef, { 
          nickname: this.nickname, 
          userProfile: this.userProfile, 
          mediaType, 
          fileData, 
          timestamp,
          userId: this.userId || 'anonymous'
        });
      };
      reader.readAsDataURL(file);
    } else {
      set(messageRef, { 
        nickname: this.nickname, 
        userProfile: this.userProfile, 
        text, 
        timestamp,
        userId: this.userId || 'anonymous'
      });
    }

    document.getElementById("chat-message-input").value = "";
    document.getElementById("chat-file-input").value = "";
    
    // 글자 수 카운터 리셋
    const charCounter = document.getElementById("chat-char-counter");
    if (charCounter) {
      charCounter.textContent = "0/1000";
      charCounter.style.color = "#999";
    }
    
    const typingRef = ref(this.db, `rooms/${this.currentRoom}/typing/${this.nickname}`);
    remove(typingRef);
  }

  exitRoom() {
    if (!this.db || !this.currentRoom) return;

    const { ref, off, remove } = window.firebaseModules;
    const messagesRef = ref(this.db, `rooms/${this.currentRoom}/messages`);
    off(messagesRef);
    
    // 사용자 ID 기반으로 타이핑 상태 및 활성 사용자 제거
    const userKey = this.userId || this.nickname;
    const typingRef = ref(this.db, `rooms/${this.currentRoom}/typing/${userKey}`);
    remove(typingRef);
    
    const activeUsersRef = ref(this.db, `rooms/${this.currentRoom}/activeUsers/${userKey}`);
    remove(activeUsersRef);
    
    const activeUsersRef2 = ref(this.db, `rooms/${this.currentRoom}/activeUsers`);
    off(activeUsersRef2);
    
    this.currentRoom = null;
    localStorage.removeItem("chatCurrentRoom");
    localStorage.removeItem("chatRoomPassword");

    document.getElementById("chat-section")?.classList.add("hidden");
    document.getElementById("chat-room-selection")?.classList.remove("hidden");
    document.getElementById("chat-box").innerHTML = "";
    document.getElementById("chat-typing-indicator").innerText = "";
  }

  async clearRoom() {
    if (!this.db || !this.currentRoom) return;

    if (confirm("정말 이 채팅방의 모든 메시지를 삭제할까요?")) {
      const { ref, remove } = window.firebaseModules;
      const messagesRef = ref(this.db, `rooms/${this.currentRoom}/messages`);
      await remove(messagesRef);
      document.getElementById("chat-box").innerHTML = "";
      alert("채팅방이 초기화되었습니다.");
    }
  }

  async deleteRoom(roomId) {
    if (!this.db) return;

    const { ref, onValue, remove } = window.firebaseModules;
    const roomRef = ref(this.db, `rooms/${roomId}`);
    
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData.creator !== this.nickname) {
        alert("이 방을 삭제할 권한이 없습니다.");
        return;
      }

      const confirmDelete = confirm(`'${roomId}' 방을 삭제하시겠습니까? 모든 메시지와 설정이 삭제됩니다.`);
      if (!confirmDelete) return;

      remove(roomRef);
      const passwordRef = ref(this.db, `roomPasswords/${roomId}`);
      remove(passwordRef).then(() => {
        alert("방이 삭제되었습니다.");
        this.loadRoomList();
      });
    }, { onlyOnce: true });
  }
}

// 전역 인스턴스 생성
window.chatRoomManager = new ChatRoomManager();

// 채팅 뷰 초기화 함수
export async function setupChatRoom() {
  await window.chatRoomManager.initUI();
}

