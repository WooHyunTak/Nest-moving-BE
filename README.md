# 🚛 이사 매칭 서비스 (Express → NestJS 마이그레이션)

이 프로젝트는 기존 **Express 기반의 백엔드**를 **NestJS**로 마이그레이션하고, 코드 리팩토링 및 기능 개선을 수행하는 데 중점을 둡니다.

Origin repository url : https://github.com/codeit-moving/moving-be

## ✨ 주요 기능

- 🏡 **고객**이 자신의 이사 정보를 등록할 수 있습니다.
- 📜 **이사 기사**가 등록된 이사 정보를 확인하고 견적서를 보낼 수 있습니다.
- 💰 **고객**은 받은 견적을 보고 업체를 확정할 수 있습니다.
- 🔔 **고객과 기사** 모두 이사 전 알림을 받을 수 있습니다.
- ⭐ **고객**은 이사가 완료된 후 기사에게 리뷰를 남길 수 있습니다.
- 🎯 **고객**은 특정 기사를 지정하여 요청할 수 있습니다.
- 📋 **고객**은 원하는 조건에 맞는 기사 리스트를 조회할 수 있습니다.
- 🔑 **OAuth 로그인 지원**: Kakao, Naver, Google 계정으로 간편 로그인 가능

## 🔑 OAuth 로그인 기능
이 프로젝트는 Kakao, Naver, Google OAuth 로그인을 지원합니다.

|OAuth 제공자	|로그인 URL|
|--------------|------------------------------------------------|
|Kakao	|/auth/kakao|
|Naver	|/auth/naver|
|Google	|/auth/google|

각 OAuth 요청을 통해 사용자는 해당 플랫폼의 계정으로 로그인할 수 있으며, 성공적으로 로그인하면 JWT 토큰이 발급됩니다.

---

## 🛠 기술 스택

| 기술          | 설명 |
|--------------|------------------------------------------------|
| ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) | 백엔드 프레임워크 |
| ![Passport JWT](https://img.shields.io/badge/Passport%20JWT-34E27A?style=flat&logo=passport&logoColor=white) | 인증 및 보안 |
| ![Class Validator](https://img.shields.io/badge/Class%20Validator-007ACC?style=flat&logo=typescript&logoColor=white) | 데이터 검증 |
| ![Multer](https://img.shields.io/badge/Multer-FF5733?style=flat) | 파일 업로드 |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white) | 데이터베이스 |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | ORM |
| ![Kakao](https://img.shields.io/badge/Kakao%20OAuth-FFCD00?style=flat&logo=kakaotalk&logoColor=black) | 카카오 로그인 |
| ![Naver](https://img.shields.io/badge/Naver%20OAuth-03C75A?style=flat&logo=naver&logoColor=white) | 네이버 로그인 |
| ![Google](https://img.shields.io/badge/Google%20OAuth-4285F4?style=flat&logo=google&logoColor=white) | 구글 로그인 |

---

## 🚀 설치 및 실행

### 1️⃣ 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고, 아래 내용을 추가하세요.

```env
# AWS S3
AWS_S3_BUCKET_NAME="your_S3_bucket_name"
AWS_S3_REGION="your_region"
AWS_S3_ACCESS_KEY="your_key"
AWS_S3_SECRET_KEY="yout_secret_key"

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/oauth/kakao/callback

# Naver OAuth
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/oauth/naver/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google/callback

# Configs
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME
JWT_SECRET=your_jwt_secret
FRONTEND_URL="your_test_front_url"
DEFAULT_PROFILE_IMAGE="default_image_url"
RUN_CONDITION=PRODUCTION
```

2️⃣ 프로젝트 설치 및 실행
```bash
# 패키지 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run start:dev
```
