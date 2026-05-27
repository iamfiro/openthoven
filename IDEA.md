Openthoven이라는 피아노 멜로디 검색 서비스를 개발해줘.

# 프로젝트 설명

Openthoven은 MIDI 데이터를 기반으로 피아노 곡을 검색하는 알고리즘 서비스이다.

관리자는 MIDI 파일을 업로드할 수 있다.
서버는 MIDI 파일을 분석하여 멜로디 데이터를 추출하고 DB에 저장한다.

사용자는 웹 화면 중앙에 있는 베토벤 이미지를 클릭해서 곡 찾기를 시작한다.
베토벤 이미지를 클릭하면 “듣는 중” 상태가 되며, 베토벤 이미지가 1초마다 바뀐다.
또한 이미지가 아래에서 위로 왔다 갔다 하는 애니메이션이 실행된다.

사용자는 피아노 건반 UI로 짧은 멜로디를 입력하고, 입력된 멜로디를 DB에 저장된 MIDI 곡 데이터와 비교하여 가장 유사한 곡을 찾는다.

딥러닝이나 AI 모델은 사용하지 않는다.
알고리즘 중심 서비스로 구현한다.

# 핵심 기능

- 서비스 이름: Openthoven
- 메인 화면 중앙 베토벤 이미지 표시
- 베토벤 이미지 클릭 시 곡 찾기 시작
- 듣는 중 상태 UI
- 베토벤 이미지 1초마다 변경
- 베토벤 이미지 아래에서 위로 왕복 애니메이션
- 피아노 건반 UI
- 사용자 멜로디 입력
- MIDI 파일 업로드
- MIDI 파싱
- 멜로디 데이터 추출
- DB 저장
- 멜로디 유사도 비교
- 가장 유사한 곡 반환

# 알고리즘 요구사항

반드시 아래 알고리즘을 사용해 구현해줘.

- 슬라이딩 윈도우
- Levenshtein Distance
- 최근접 탐색
- 선형 탐색 기반 곡 비교

검색 방식:

1. 사용자가 입력한 음 배열을 만든다.
2. DB에 저장된 모든 곡을 가져온다.
3. 각 곡의 긴 멜로디 배열에서 사용자 입력 길이만큼 슬라이딩 윈도우를 만든다.
4. 각 윈도우 구간과 사용자 입력 배열의 Levenshtein Distance를 계산한다.
5. 곡마다 가장 작은 distance를 저장한다.
6. 모든 곡 중 distance가 가장 작은 곡을 최종 결과로 반환한다.

# MIDI 데이터 처리 방식

MIDI 음표는 MIDI Note Number 배열로 저장한다.

예시:

[60, 62, 64, 65, 67]

곡 데이터는 아래 형태로 저장한다.

{
  "id": 1,
  "title": "Für Elise",
  "artist": "Beethoven",
  "notes": [64, 63, 64, 63, 64, 59, 62, 60, 57]
}

# 기술 스택

Frontend:
- React
- TypeScript
- SCSS Module
- Vite

Backend:
- Node.js
- Express
- TypeScript

Database:
- SQLite

# 프론트엔드 요구사항

- Openthoven 메인 페이지 구현
- 화면 중앙에 베토벤 이미지 배치
- 베토벤 이미지 클릭 이벤트 구현
- 클릭 시 listening 상태로 변경
- listening 상태일 때 베토벤 이미지가 1초마다 다른 이미지로 변경
- listening 상태일 때 이미지가 아래에서 위로 왔다 갔다 하는 애니메이션 적용
- 피아노 건반 UI 구현
- 건반 클릭 시 MIDI Note Number 배열에 추가
- 현재 입력된 멜로디 배열 표시
- 검색 버튼 구현
- 검색 결과 UI 구현
- 결과로 곡 제목, 작곡가, 유사도 점수 표시
- 반응형 UI 구현

# 백엔드 요구사항

- MIDI 업로드 API 구현
- MIDI 파싱 로직 구현
- 곡 목록 조회 API 구현
- 곡 검색 API 구현
- Levenshtein Distance 함수 구현
- 슬라이딩 윈도우 검색 함수 구현
- SQLite DB 저장 구현

# API 요구사항

GET /songs
- 저장된 곡 목록 반환

POST /songs/upload
- MIDI 파일 업로드
- MIDI 파일에서 note number 배열 추출
- DB에 title, artist, notes 저장

POST /songs/search
Request:
{
  "notes": [60, 62, 64, 65, 67]
}

Response:
{
  "title": "Für Elise",
  "artist": "Beethoven",
  "distance": 1,
  "similarity": 0.85
}

# 파일 구조

frontend/
  src/
    components/
      beethoven-listener/
        index.tsx
        style.module.scss
      piano-keyboard/
        index.tsx
        style.module.scss
      search-result/
        index.tsx
        style.module.scss
    pages/
      home/
        index.tsx
        style.module.scss
    api/
      songs.api.ts
    types/
      song.type.ts
    App.tsx
    main.tsx

backend/
  src/
    routes/
      songs.route.ts
    controllers/
      songs.controller.ts
    services/
      midi.service.ts
      search.service.ts
    algorithms/
      levenshtein.ts
      sliding-window-search.ts
    db/
      database.ts
    types/
      song.type.ts
    app.ts
    server.ts

# 구현 조건

- 실제 실행 가능한 코드로 작성해줘.
- 프론트엔드와 백엔드를 모두 구현해줘.
- 필요한 패키지도 알려줘.
- DB 초기화 코드도 작성해줘.
- 알고리즘 코드는 분리해서 작성해줘.
- 핵심 알고리즘에는 주석을 달아줘.
- UI는 고급스럽지 않아도 되지만 실제로 동작해야 한다.
- 베토벤 이미지는 assets 폴더에 beethoven-1.png, beethoven-2.png, beethoven-3.png가 있다고 가정하고 구현해줘.
- listening 상태에서는 1초마다 이미지가 바뀌어야 한다.
- 이미지 애니메이션은 CSS keyframes로 구현해줘.
- 과도한 아키텍처는 사용하지 말고 MVP 기준으로 작성해줘.