# family-gifticon-app

가족이 함께 쓰는 기프티콘(바코드/쿠폰) 관리 앱.

## 목표
- 흩어진 기프티콘을 한 곳에서 관리
- 만료 알림으로 소멸 최소화
- 가족 간 공유/양도/사용 처리 단순화
- 만료 임박 쿠폰을 먼저 소비하도록 안내

## 현재 상태
- Web(PWA) + Google OAuth 기반 MVP 스캐폴딩 완료
- 홈/캘린더 화면은 Supabase `gifticons` 테이블 실데이터 조회로 동작

## 문서
- `docs/PRD.md` : 제품 기획 요약
- `docs/ISSUES.md` : 개발 이슈 체크리스트
- `docs/ARCHITECTURE.md` : 웹(PWA) + Google OAuth 아키텍처 초안
- `docs/SETUP.md` : Supabase + Google OAuth 로컬/운영 설정 가이드

## 로컬 실행
```bash
npm install
cp .env.example .env.local
npm run dev
```

기본 URL: `http://localhost:3000`

## 주요 명령어
- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 빌드 결과 실행
- `npm run typecheck`: TypeScript 타입 검사

## 핵심 화면
- `/` : 만료 임박 우선 홈 (`오늘 만료`, `D-1~3`, `D-4~7`)
- `/calendar` : 월간 만료 캘린더
- `/auth` : Google OAuth 로그인 시작

## 기술 스택
- Frontend: Next.js (App Router, TypeScript)
- Auth/DB/Storage: Supabase
- 배포: Vercel (예정)

## 브랜치 전략
- `main`: 안정 배포
- `develop`: 통합 개발
- `feature/*`: 기능 브랜치
