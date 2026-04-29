# 👨‍💻 Code Sync - 더 나은 코드 리뷰 경험을 위한 실시간 협업 플랫폼

<p align='center'>
  <!-- 프로젝트 로고/메인 이미지 -->
</p>

## 🌟 서비스 소개글

GitHub PR을 통해 코드 리뷰를 하면서 이런 불편함을 겪으신 적 있나요?

😫 "PR 댓글만으로는 의도 전달이 너무 어려워..."

😤 "화면 공유하면서 설명하고 싶은데 마우스로 가리키기만 할 수 있고..."

🤔 "실시간으로 코드를 수정하면서 리뷰하고 싶은데..."

이 모든 불편함을 해결하는 서비스, Code Sync를 소개합니다!

## 💡 프로젝트의 주요 목적
코드 리뷰를 실시간, 효율적으로! PR 댓글로는 부족했던 소통을, 음성과 화면 공유로 즉각적이고 명확하게! Code Sync가 여러분의 코드 리뷰 경험을 한 단계 높여드립니다.

## ⚙️ 프로젝트의 주요 기능
1. **실시간 코드 리뷰**
   - GitHub PR 코드 실시간 확인 및 수정
   - Monaco Editor를 통한 즉각적인 코드 편집
   - 변경사항 실시간 동기화

2. **효과적인 커뮤니케이션**
   - WebRTC 기반 음성/화면 공유
   - Excalidraw를 활용한 시각적 설명
   - 실시간 채팅 기능

3. **협업 도구**
   - Yjs 기반 실시간 동시 편집
   - 화이트보드 기능
   - 세션 녹화/재생 기능

## ⚙ 기술 스택
<p align="center"> <img src="https://github.com/user-attachments/assets/de67fc3f-fc60-4a95-86cd-5b99f66384bb" alt="Tech Stack" width="800"> </p>

## ⌹ 시스템 아키텍처
<p align="center"> <img src="https://github.com/user-attachments/assets/9564acc6-2a55-4875-94b1-5aa33079150c" alt="System Architecture" width="800"> </p>

## 📺 시연 및 발표 영상
<p align="center">
  <a href="https://www.youtube.com/watch?v=yfaaHW_4KC8" target="_blank">
    <img src="https://img.youtube.com/vi/yfaaHW_4KC8/0.jpg" alt="Code Sync Demo" width="400">
  </a>
</p>

[🎥 발표 영상 전체 보기](https://www.youtube.com/watch?v=yfaaHW_4KC8)


### 🔄 포스터
<details>
<summary>포스터 보기</summary>
<p align="center">
  <img src="https://github.com/user-attachments/assets/8f983fda-e4c3-4c52-9e16-177069c2f03f" alt="poster" width="800">
</p>
</details>

## 🔗 참고 링크
### Swagger API 문서
- [API 문서 바로가기](https://code-sync.net/api/api-document#/)


## 👨‍👩‍👧‍👦 팀원 소개
| **Frontend** | **Frontend** | **Frontend** | **Backend** | **Backend** |
| :------: |  :------: | :------: | :------: |  :------: |
| **박건우** | **임채승** | **윤민성** | **지창근** | **조형욱** |
| [<img src="https://avatars.githubusercontent.com/u/133184988?v=4" height=150 width=150> <br/> @pigpgw](https://github.com/pigpgw) |  [<img src="https://avatars.githubusercontent.com/u/45393030?v=4" height=150 width=150> <br/> @loopy-lim](https://github.com/loopy-lim) | [<img src="https://avatars.githubusercontent.com/u/171473497?v=4" height=150 width=150> <br/> @Y-minseong](https://github.com/Y-minseong) | [<img src="https://avatars.githubusercontent.com/u/80716462?v=4" height=150 width=150> <br/> @pig19980](https://github.com/pig19980) | [<img src="https://avatars.githubusercontent.com/u/173615995?v=4" height=150 width=150> <br/> @HyoungUkJo](https://github.com/HyoungUkJo) |


### 파일구조

```
├── public
├── src
│   ├── assets
│   ├── components
│   │   ├── Form
│   │   │   ├── FormItem
│   │   │   │   ├── ButtonFormItem.tsx
│   │   │   │   └── InputFormItem.tsx
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── type.d.ts
│   │   └── ...
│   ├── apis
│   │   └── dtos
│   ├── functions
│   ├── hooks
│   ├── pages
│   ├── routers
│   ├── store
│   └── ...
└── ...
```

### 사용하고 있는 라이브러리

- [blocknote](https://www.blocknotejs.org/)
- [monaco](https://github.com/microsoft/monaco-editor)
- [tldraw](https://github.com/tldraw/tldraw)
- [axios](https://axios-http.com/)
- [socket.io](https://socket.io/)
- [tailwind](https://tailwindcss.com/)
- [y-js](https://github.com/yjs/yjs)
- [zustnad](https://github.com/pmndrs/zustand)
