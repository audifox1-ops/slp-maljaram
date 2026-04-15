<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

이 프로젝트는 언어재활사/미술치료사를 위한 전문 치료 일지 도우미 **SLP.Docs**입니다.

## 🚀 배포 (Deployment)

### 1. Vercel 배포 (권장)
이 프로젝트는 Vercel에 최적화되어 있습니다.
1. GitHub 저장소를 Vercel 대시보드에 연결합니다.
2. **Environment Variables**에 `GEMINI_API_KEY`를 추가합니다.
3. 자동으로 `dist` 폴더가 빌드 및 배포됩니다.

### 2. AI Studio 동기화
AI Studio 프로젝트 주소: [https://ai.studio/apps/f6c3d59c-c8ab-4ba0-973b-32245977679a](https://ai.studio/apps/f6c3d59c-c8ab-4ba0-973b-32245977679a)

> [!CAUTION]
> **저장소 주소 확인**: AI Studio 설정에서 저장소 이름이 **`SLP.DOCS`**(마지막에 마침표 없음)로 연결되어 있는지 확인해 주세요. 마침표가 포함된 구형 주소는 동기화 오류를 일으킬 수 있습니다.

## 💻 로컬 실행 (Run Locally)

**Prerequisites:** Node.js

1. 의존성 설치:
   `npm install`
2. `.env` 파일 생성 후 `GEMINI_API_KEY` 설정 (또는 `.env.example` 참고)
3. 로컬 서버 실행:
   `npm run dev`
