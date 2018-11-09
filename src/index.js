import '@babel/polyfill' // 이 라인을 지우지 말아주세요!

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

//템플릿목록
const templates = {
  layout: document.querySelector('#layout').content,
  loginForm: document.querySelector('#login-form').content,
  productList: document.querySelector('#product-list').content,
  productItem: document.querySelector('#product-item').content,
  productDetail: document.querySelector('#product-detail').content,
  detailImage: document.querySelector('#detail-image').content
}

const rootEl = document.querySelector('.root')
//template 으로 묶인 HTML 아이들은 동작에 의해 나타나는 거잖아.
//그래서 div.root를 해놓고 나타내어져야 하는 아이들을 그 안에 넣는거야.
//rootEl은 화면에 나타내는 역할을 하는거야 !

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

//메인화면 구현
// fragment를 받아서 layout에 넣은 다음 rootEl에 그려주는 함수
function drawFragment(frag) {
  //1. 템플릿 복사
  const layoutFrag = document.importNode(templates.layout, true)

  //2. 요소 선택
  const mainEl = layoutFrag.querySelector('.main')
  const loginEl = layoutFrag.querySelector('.appbar__sign-in')

  // 5. 이벤트 리스너 등록하기
  loginEl.addEventListener('click', async e=>{
    drawLoginForm()
  })

  //6.템플릿을 문서에 삽입
  mainEl.appendChild(frag)
  //메인화면에 있는 버튼을 누르면 그 안에서 화면을 변하게 하는 것
  rootEl.textContent = ''
  rootEl.appendChild(layoutFrag)
  //변화된 전체 화면 출력
}

//상품목록구현
async function drawProductList(category) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productList, true)

  // 2. 요소 선택
  const productListEl = frag.querySelector('.product-list')
  //const outerEl = frag.querySelector('.navbar_outer')


  // 3. 필요한 데이터 불러오기
  const params = {}
  if (category) {
    params.category = category
  }
  const response = await api.get('/products', {
    params
  })
  const productList = response.data
  // /products 경로로 api.get 을 이용하여 받아온다.
  // await 응답을 기다린다.
  // productList 데이터가 온다.

  // 4. 내용 채우기
  for (const { id: postId, title, description, mainImgUrl } of productList) {
    //
    // 1. 템플릿 복사
    const frag = document.importNode(templates.productItem, true)

    // 2. 요소 선택
    const productItemEl = frag.querySelector('.product-item')
    const mainImageEl = frag.querySelector('.main-image')
    const titleEl = frag.querySelector('.title')
    const descriptionEl = frag.querySelector('.description')


    // 3. 필요한 데이터 불러오기 - x
    // 4. 내용 채우기
    mainImageEl.setAttribute('src', mainImgUrl)
    //src라는 이름에 mainImg Url을 넣어라

    titleEl.textContent = title
    descriptionEl.textContent = description

    // 5. 이벤트 리스너 등록하기
    productItemEl.addEventListener('click', e => {
      drawPostDetail(postId)
    })

    // 6. 템플릿을 문서에 삽입
    productListEl.appendChild(frag)
  }
  // 5. 이벤트 리스너 등록하기
  // outerEl.addEventListener('click', e => {
  //   e.preventDefault();
  //   const response = await api.get('/products', {
  //     params: {
  //       category: "Outer"
  //     }
  // })
  // const productItems = response.data
  // productListEl.appenChild(productItems)
  // })

  // 6. 템플릿을 문서에 삽입
  drawFragment(frag)
}

//로그인폼 기능 구현
async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true)
  //현재문서가 아닌 외부 html의 문서의 노드를 복사해와서 현재문서에 넣어준다.

  // 2. 요소 선택
  const formEl = frag.querySelector('.login-form')
  //form class를 불러서 설정한 요소를 지정해준다.

  // 3. 필요한 데이터 불러오기 - 필요없음
  // 4. 내용 채우기 - 필요없음

  // 5. 이벤트 리스너 등록하기
    formEl.addEventListener('submit', async e => {
      e.preventDefault()
      const username = e.target.elements.username.value
      const password = e.target.elements.password.value

      const res = await api.post('/users/login', {
        username,
        password
      })
    //server주소에 username과 password를 써서 /users/login/경로로
    //api.post 를 이용하여 보내면
    //awiat 응답을 기다린다.
    //res 응답이 온다.

      localStorage.setItem('token', res.data.token)
      //The setItem() method of the Storage interface,
      //when passed a key name and value, will add that key to the storage,
      //or update that key's value if it already exists.
      //위에서 res라는 응답객체에 .data.token을 붙이면 응답과 함께 실려온 토큰을 꺼내올수 있어영
      //그걸 꺼내서 'token' 이라는 곳에 넣어서 local Storage에 저장을 한다는 말씀!
      DrawLoginAfter()
      //로그인 한후 뜨는 화면을 그리기 (지금 현재는 내가 임의 지정)
    })
  // 6. 템플릿을 문서에 삽입
    // rootEl.textContent = ''
    // rootEl.appendChild(frag)
    drawFragment(frag)
  }

  //상품 상세
 async function drawPostDetail(productId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productDetail, true)
  //화면에서 상품이미지를 클릭했을때, 나오는 상품 상세페이지 템플릿을 선택하여 복사

  // 2. 요소 선택
  const mainImageEl = frag.querySelector('.main-image')
  const titleEl = frag.querySelector('.title')
  const descriptionEl = frag.querySelector('.description')
  const priceEl=frag.querySelector('.price')
  const cartFormEl = frag.querySelector('.cartForm')
  const detailImageListEl = frag.querySelector('.detail-image-list')

  // 3. 필요한 데이터 불러오기
  const { data: {
    title,
    price,
    mainImgUrl,
    detailImgUrls
  } } = await api.get(`/products/${productId}`)

  console.log(detailImgUrls)
  // 4. 내용 채우기
  mainImageEl.setAttribute('src', mainImgUrl)
  titleEl.textContent = title
  priceEl.textContent = price
  for (const url of detailImgUrls) {
    const frag = document.importNode(templates.detailImage, true)

    const detailImageEl = frag.querySelector('.detail-image')

    detailImageEl.setAttribute('src', url)

    detailImageListEl.appendChild(frag)
  }

  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  drawFragment(frag)
}

drawProductList()

