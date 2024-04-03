const API_KEY = config.apikey;
let newsList = [];

const menus = document.querySelectorAll(".menus button");
menus.forEach((menus) =>
  menus.addEventListener("click", (event) => getNewsByCategory(event))
);

let url = new URL(
  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
);

let totalResults = 0; //article의 값이 0보다 크면 data.totalResult의 값 넣어줌
let page = 1;
const pageSize = 10; //고정된 값
const groupSize = 5; //고정된 값

//url을 가져와서 화면에 보여주는 함수
const getNews = async () => {
  try {
    //error 처리
    url.searchParams.set("page",page); // &page=page
    url.searchParams.set("pageSize",pageSize); // &pageSize=pageSize

    const response = await fetch(url); //url 호출 전 page setting
    const data = await response.json();

    if (response.status == 200) { //정상 작동할 때 (no error)
        if(data.articles.length === 0){ //값이 없을 때
            throw new Error("No matching results found.");
        }
      newsList = data.articles;
      totalResults = data.totalResults;
      render();
      paginationRander();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.log("error", error.message);
    errorRender(error.message);
  }
};

//뉴스 api를 가져오는 함수
const getLatestNews = async () => {
  getNews();
};

//뉴스의 카테고리를 가져오는 함수
const getNewsByCategory = async (event) => {
  const category = event.target.textContent.toLowerCase();

  url = new URL(
    `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`
  );

  getNews();
};

//키워드를 가져오는 함수
const getNewsByKeyword = async () => {
  const keyword = document.getElementById("search-input").value;

  url = new URL(
    `https://newsapi.org/v2/top-headlines?country=us&q=${keyword}&apiKey=${API_KEY}`
  );

  getNews();
};

//화면에 뉴스를 출력하는 함수
const render = () => {
  const newsHTML = newsList
    .map(
      (news) => `<div class="row news-contents">
                    <div class="col-lg-4">
                        <img class="news-img-size"
                            src="${
                              news.urlToImage ||
                              "https://peoplevine.blob.core.windows.net/media/72/e86f3854-ebcf-4025-ae66-220b51f77ec2/image_not_available.png"
                            }"/>
                    </div>
                    <div class="col-lg-8">
                        <h2>${news.title || "no content"}</h2>
                        <p>
                        ${
                          news.description == null || news.description == ""
                            ? "내용없음"
                            : news.description.length > 200
                            ? news.description.substring(0, 200) + "..."
                            : news.description
                        }
                        </p>
                        <div>
                        ${news.source.name || "no source"} / ${
        news.publishedAt
      } (${moment(news.publishedAt).fromNow()})
                        </div>
                    </div>
                </div>`
    )
    .join("");

  document.getElementById("news-board").innerHTML = newsHTML;
};

//error 출력하는 함수
const errorRender = (errorMessage) => {
  const errorHTML = `<div class="alert alert-danger" role="alert" align="center">
        ${errorMessage}
    </div>`;

    document.getElementById("news-board").innerHTML = errorHTML
};


/*
default 제공 데이터)
 pagesize : 20
 page 정보
 totalResults : 전체 데이터 개수
total 페이지 수 : (전체 데이터개수/page개수) + 나머지 (올림!)

알아야하는 포인트 : totalResult(주어지는 값), pageSize, page, groupSize
구해야하는 값
 totalPage = totalResult/pageSize-> 올림 (Math.ceil)
 pageGroup = page/groupSize -> 올림 (Math.ceil)
 마지막페이지 값 = pageGroup * groupSize
 첫번째 페이지 = 마지막페이지-(groupsize-1)
 -> 첫번째~마지막 random
*/

//pagination 화면에 출력하는 함수
const paginationRander = () => {
  //totalResult -> 주어지는 값
  //pageSize -> 변수 선언
  //page -> 변수 선언
  //groupSize -> 변수 선언

  //1. totalPages
  const totalPages = Math.ceil(totalResults / pageSize);
  //2. pageGroup  올림 = Math.ceil
  const pageGroup = Math.ceil(page / groupSize);
  //3. lastPage : 마지막 페이지는 몇번째인지
  let lastPage = pageGroup * groupSize;
   //3-1. 마지막 페이지 그룹이 groupSize보다 작을때, lastpage = totalpage
   if(lastPage > totalPages){
    lastPage = totalPages;
   }
  //4. firstPage : 처음 페이지는 몇번째인지
   //pageSize가 5이기 때문에, 마지막 페이지가 낮게 조절되어 시작페이지가 0 이하로 설정되었다면 1로 바꿔주기
  const firstPage =
   lastPage - (groupSize - 1) <= 0
    ? 1 
    : lastPage - (groupSize - 1) ;

  
  //Previous
  let paginationHTML = `
      <li class="page-item ${page==1?"disabled":""}" onclick="moveToPage(${firstPage})"><a class="page-link" href="#">&lt;&lt;</a></li>
      <li class="page-item ${page==1?"disabled":""}" onclick="moveToPage(${page-1})"><a class="page-link" href="#">&lt;</a></li>
  `;

  //배열이 아닌 숫자이기 때문에 for문 사용 가능
  for(let i = firstPage; i<=lastPage; i++){
    paginationHTML += `<li class="page-item ${i==page?"active":''}" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`;
  }

  //Next
  paginationHTML += `
  <li class="page-item ${page==lastPage?"disabled":""}" onclick="moveToPage(${page+1})"><a class="page-link" href="#">&gt;</a></li>
  <li class="page-item ${page==lastPage?"disabled":""}" onclick="moveToPage(${lastPage})"><a class="page-link" href="#">&gt;&gt;</a></li>
  `;


  document.querySelector(".pagination").innerHTML = paginationHTML;  
}

//페이지 이동 함수
const moveToPage = (pageNum) => {
  console.log("moveToPage",pageNum);
  page = pageNum;
  getNews();
}

getLatestNews();