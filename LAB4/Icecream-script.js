fetch('products.json').then(function(response) {
  return response.json();
}).then(function(json) {
  let products = json;
  initialize(products);
}).catch(function(err) {
  console.log('There has been a problem during fetch operation: ' + err.message);
});

// 무한 스크롤
window.onscroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight){
    initialize(products);
  }
}

function initialize(products) {
  // grab the UI elements that we need to manipulate
  const category = document.querySelector('#category');
  const search_term = document.querySelector('#search_term');
  const search_button = document.querySelector('button');
  const main = document.querySelector('main');

  // 이전 카테고리 기억
  let lastCategory = category.value;
  // 이전 검색어 기억
  let lastSearch = '';

  // these contain the results of filtering by category, and search term
  // finalGroup will contain the products that need to be displayed after
  // the searching has been done. Each will be an array containing objects.
  // Each object will represent a product
  let categoryGroup;
  let finalGroup;

  // To start with, set finalGroup to equal the entire products database
  // then run updateDisplay(), so ALL products are displayed initially.
  finalGroup = products;
  updateDisplay();

  // Set both to equal an empty array, in time for searches to be run
  categoryGroup = [];
  finalGroup = [];

  // 버튼 누를 시 카태고리 분류 시작
  search_button.onclick = setCategory;

  function setCategory(e) {

    e.preventDefault();

    categoryGroup = [];
    finalGroup = [];

    // 지금 필터 내용이 이전 필터와 같으면 아무것도 안함
    if(category.value === lastCategory && search_term.value.trim() === lastSearch) {
      return;
    } else {
      // 지금 카테고리 및 검색어 저장
      lastCategory = category.value;
      lastSearch = search_term.value.trim();

      // 카테고리 따라서 출력할 물건 선택
      if(category.value === 'All') {
        categoryGroup = products;
        selectProducts();
      } else {
        // 소문자로 변환
        let lowerCaseCategory = category.value.toLowerCase();
        for(let i = 0; i < products.length ; i++) {
          if(products[i].type === lowerCaseCategory) {
            categoryGroup.push(products[i]);
          }
        }
        // 해당 카테고리로 검색
        selectProducts();
      }
    }
  }

  // selectProducts() Takes the group of products selected by selectCategory(), and further
  // filters them by the tiered search term (if one has been entered)
  function selectProducts() {
    // 검색 내용에 따라 상품들 출력
    if(search_term.value.trim() === '') {
      finalGroup = categoryGroup;
      updateDisplay();
    } else {
      // 검색어에 따라서 물건 선택
      let lowerCaseSearchTerm = search_term.value.trim().toLowerCase();
      for(let i = 0; i < categoryGroup.length ; i++) {
        if(categoryGroup[i].name.indexOf(lowerCaseSearchTerm) !== -1) {
          finalGroup.push(categoryGroup[i]);
        }
      }

      // 상품들 출력
      updateDisplay();
    }

  }

  // 필터에 따라 상품목록 새로 출력
  function updateDisplay() {
    // 이전 상품목록 다 없애기
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    // 출력할 물건 없을 시, 메시지 출력
    if(finalGroup.length === 0) {
      const message = document.createElement('p');
      message.textContent = '검색된 상품이 없습니다!';
      main.appendChild(message);
    // 있으면 이미지들 출쳑
    } else {
      for(let i = 0; i < finalGroup.length; i++) {
        fetchBlob(finalGroup[i]);
      }
    }
  }

  // 이미지 fetch 및 출력 함수
  function fetchBlob(product) {
    // 이미지 파일 경로 지정
    let url = 'images/' + product.image;

    // 이미지 fetch - blob 로 바꿈d
    fetch(url).then(function(response) {
        return response.blob();
    }).then(function(blob) {
      // blob 을 url 객체로 바꿈
      let objectURL = URL.createObjectURL(blob);
      // 상품 이미지 출력
      showProduct(objectURL, product);
    });
  }

  // <main>에 상품이미지 출력하는 함수
  function showProduct(objectURL, product) {
    // create <section>, <h2>, <p>, and <img> elements
    const section = document.createElement('section');
    const heading = document.createElement('h2');
    const para = document.createElement('p');
    const image = document.createElement('img');
    const more_info = document.createElement('p');
    more_info.classList.add('goods_btn');
    more_info.textContent= 'Click to see more';

    // 색션에 해당 제품의 타입을 클래스로 지정
    section.setAttribute('class', product.type);

    // Give the <h2> textContent equal to the product "name" property, but with the first character
    // replaced with the uppercase version of the first character
    heading.textContent = product.name.replace(product.name.charAt(0), product.name.charAt(0).toUpperCase());
    heading.classList.add('goods_info');

    // Give the <p> textContent equal to the product "price" property, with a $ sign in front
    // toFixed(2) is used to fix the price at 2 decimal places, so for example 1.40 is displayed
    // as 1.40, not 1.4.
    para.textContent = product.price + "원";
    para.classList.add('goods_price');

    // Set the src of the <img> element to the ObjectURL, and the alt to the product "name" property
    image.src = objectURL;
    image.alt = product.name;
    image.classList.add('goods_img');
    // main에 이미지 및 더 보기 기능 넣기
    main.appendChild(section);
    section.appendChild(image);
    section.appendChild(more_info);
    more_info.onclick = showMore;

    function showMore(){
      section.appendChild(heading);
      section.appendChild(para);
      section.removeChild(more_info);
    }

  }
}
