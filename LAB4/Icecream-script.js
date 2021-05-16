document.addEventListener('DOMContentLoaded', productLoad);

// load 함수
function productLoad(){
  fetch('products.json').then(function(response) {
    return response.json();
  }).then(function(json) {
    let products = json;
    initialize(products);
  }).catch(function(err) {
    console.log('There has been a problem during fetch operation: ' + err.message);
  });
}

// 무한 스크롤
// 무한 스크롤에 필요한 변수들 정의
let infinite_count = 0;
let infinite_count_max = 10;
let on_infinite = false;
// 상품수가 충분히 많은 카테고리인 all일 때만 돌아가게 함
window.onscroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight){
    if(infinite_count < infinite_count_max && document.querySelector("#category").value === "All"){
      infinite_count++;
      on_infinite = true;
      productLoad();
    }
  }
};

function initialize(products) {
  // 이미지를 받아오는데 필요한 엘리먼트들 정의
  const selected_category = document.querySelector("#category");
  const selected_search_term = document.querySelector("#search_term");
  const search_button = document.querySelector("button");
  const main = document.querySelector("main");

  // 이전 카테고리 기억
  let prev_category = selected_category.value;
  // 이전 검색어 초기화
  let prev_search = '';

  // 필터를 통해서 걸러진 상품들을 담을 그룹 생성
  let category_filtered_group;
  let final_filtered_group;

  // 처음에는 일단 모든 상품들을 담아서 출력함
  final_filtered_group = products;
  updateProductsDisplay();

  // 필터 초기화
  category_filtered_group = [];
  final_filtered_group = [];

  // 검색 버튼 누를 시 카태고리 분류 시작
  search_button.onclick = categoryFilter;

  function categoryFilter(e) {

    e.preventDefault();
    // 검색으로 걸러진 경우에는 무한 스크롤 적용 안 함 + 스크롤 횟수 초기화
    infinite_count = 0;
    on_infinite = false;

    category_filtered_group = [];
    final_filtered_group = [];

    // 지금 필터 내용이 이전 필터와 같으면 아무것도 안함
    if(selected_category.value === prev_category && selected_search_term.value.trim() === prev_search) {
      return;
    } else {
      // 지금 카테고리 및 검색어 저장
      prev_category = selected_category.value;
      prev_search = selected_search_term.value.trim();

      // 카테고리 따라서 출력할 물건 선택
      if(selected_category.value === 'All') {
        category_filtered_group = products;
        selectProducts();
      } else {
        // 카테고리로 필터링 된 상품들을 필터 그룹에 저장
        // 카테고리 명이 영어일 경우 대비
        let lowerCaseCategory = selected_category.value.toLowerCase();
        for(let i = 0; i < products.length ; i++) {
          if(products[i].type === lowerCaseCategory) {
            category_filtered_group.push(products[i]);
          }
        }
        // 해당 카테고리로 검색
        selectProducts();
      }
    }
  }


  // 카테고리로 필터링 된 상품들을 다시 검색어로 필터링
  function selectProducts() {
    // 검색 내용이 없을 경우 바로 상품들 출력
    if(selected_search_term.value.trim() === '') {
      final_filtered_group = category_filtered_group;
      updateProductsDisplay();
    } else {
      // 검색어에 따라서 상품들 필터링
      let lowerCaseSearchTerm = selected_search_term.value.trim().toLowerCase();
      for(let i = 0; i < category_filtered_group.length ; i++) {
        if(category_filtered_group[i].name.indexOf(lowerCaseSearchTerm) !== -1) {
          final_filtered_group.push(category_filtered_group[i]);
        }
      }
      // 상품들 출력
      updateProductsDisplay();
    }

  }

  // 필터링 된 상품들을 출력
  function updateProductsDisplay() {
    // 무한 스크롤 중이라면 상품목록 초기화 없이 똑같은 상품 추가만 하면 됌
    if(on_infinite){
      for(let i = 0; i < final_filtered_group.length; i++) {
        fetchBlob(final_filtered_group[i]);
      }
    }
    else{
      // 이전 상품목록 다 없애기
      while (main.firstChild) {
        main.removeChild(main.firstChild);
      }
      // 출력할 물건 없을 시, 메시지 출력
      if(final_filtered_group.length === 0) {
        const message = document.createElement('p');
        message.textContent = '검색된 상품이 없습니다!';
        main.appendChild(message);
      // 있으면 이미지들 출쳑
      } else {
        for(let i = 0; i < final_filtered_group.length; i++) {
          fetchBlob(final_filtered_group[i]);
        }
      }
    }
  }

  // 이미지 fetch 및 출력 함수
  function fetchBlob(product) {
    // 이미지 파일 경로 지정
    let url = 'images/' + product.image;

    // 이미지 fetch - blob 로 바꿈
    fetch(url).then(function(response) {
        return response.blob();
    }).then(function(blob) {
      // blob 을 url 객체로 바꿈
      let objectURL = URL.createObjectURL(blob);
      // 상품 이미지 출력
      productDisplay(objectURL, product);
    });
  }

  // <main>에 상품이미지 출력하는 함수
  function productDisplay(objectURL, product) {
    // 상품 출력에 필요한 엘리먼트들 정의
    const section = document.createElement("section");
    const goods_name = document.createElement("h2");
    const goods_price = document.createElement("p");
    const goods_image = document.createElement("img");
    const more_info = document.createElement("p");

    // 더 알아보기 부분 설정
    more_info.classList.add('goods_btn');
    more_info.textContent= '더 알아보기';

    // 색션에 해당 제품의 타입을 클래스로 지정
    section.setAttribute('class', product.type);

    // 추가 정보 - 제품 이름 부분 설정
    goods_name.textContent = product.name.replace(product.name.charAt(0), product.name.charAt(0).toUpperCase());
    goods_name.classList.add('goods_info');

    // 추가 정보 - 제품 가격 부분 설정
    goods_price.textContent = product.price + "원";
    goods_price.classList.add('goods_price');

    // 제품 이미지 설정
    goods_image.src = objectURL;
    goods_image.alt = product.name;
    goods_image.classList.add('goods_img');

    // <main>에 이미지 및 더 알아보기 기능 요소들 넣기
    main.appendChild(section);
    section.appendChild(goods_image);
    section.appendChild(more_info);
    more_info.onclick = showMore;

    // 더 알아보기 버튼 누를 시 더 알아보기 버튼은 사라지고 추가 정보들이 나옴
    function showMore(){
      section.appendChild(goods_name);
      section.appendChild(goods_price);
      more_info.remove();
    }

  }
}
