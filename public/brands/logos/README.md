# 브랜드 로고 넣는 곳

지점 상세 페이지의 "보유 웨이트 브랜드"에 표시할 로고 파일을 여기에 넣습니다.
파일을 넣으면 해당 브랜드가 **자동으로 로고로 표시**되고, 없는 브랜드는 텍스트 칩으로 유지됩니다.

## 파일 규칙
- **파일명**: 아래 slug 그대로 (예: `hammer-strength.svg`)
- **형식**: SVG 권장 (없으면 배경 투명 PNG/WEBP, 높이 80px 이상)
- **색상**: 사이트가 다크 테마이므로 **흰색 또는 단색(모노) 버전** 권장 (검정 워드마크는 안 보임)

## 파일명 목록 (사용 지점 수 순)
| 브랜드 | 파일명 |
|---|---|
| 뉴텍 | `newtec.svg` |
| 해머스트렝스 | `hammer-strength.svg` |
| 아스널 | `arsenal-strength.svg` |
| 테크노짐 | `technogym.svg` |
| 프라임 | `prime.svg` |
| 파나타 | `panatta.svg` |
| 프리모션 | `primotion.svg` |
| 라이프피트니스 | `life-fitness.svg` |
| 아틀란티스 | `atlantis.svg` |
| 짐레코 | `gymreco.svg` |
| 부티빌더 | `bootybuilder.svg` |
| 짐80 | `gym80.svg` |
| 호이스트 | `hoist.svg` |
| 사이벡스 | `cybex.svg` |
| 너틸러스 | `nautilus.svg` |
| 디랙스 | `drax.svg` |
| 왓슨 | `watson.svg` |
| 로저스 | `rogers.svg` |
| 스타트렉 | `star-trac.svg` |
| 포커스 | `focus.svg` |
| 매트릭스 | `matrix.svg` |
| 다이나벡 | `dynavec.svg` |
| 펜듈럼 | `pendulum.svg` |
| 신코 | `shinko.svg` |
| 렙콘 | `repcon.svg` |

로고를 넣은 뒤 재배포하면 반영됩니다. (매핑은 `src/lib/brandLogos.ts`)
