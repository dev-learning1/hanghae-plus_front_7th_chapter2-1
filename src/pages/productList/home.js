import { getProducts as fetchProducts, getCategories as fetchCategories } from "../../api/productApi.js";
import { ProductList, SearchBox } from "./components/index.js";
import { createSignal } from "../../store/signal.js";

/**
 * @typedef {Object} ProductListType
 * @property {Filter} filters
 * @property {Pagination} pagination
 * @property {Product[]} products
 */

// Signal 생성: [getter, setter, subscribe]
const [getLoading, setLoading, subscribeLoading] = createSignal(true);
const [getProducts, setProducts, subscribeProducts] = createSignal([]);
const [getCategories, setCategories, subscribeCategories] = createSignal({});
const [getSelectedCategory1, setSelectedCategory1] = createSignal(null);
const [getSelectedCategory2, setSelectedCategory2] = createSignal(null);
const [getLimit, setLimit] = createSignal(20); // 기본값 20개
const [getSort, setSort] = createSignal("price_asc"); // 기본값 가격 낮은순

// 카테고리 변경 핸들러
const handleCategoryChange = (category1, category2) => {
  setSelectedCategory1(category1);
  setSelectedCategory2(category2);
  // 카테고리가 변경되면 상품 목록을 다시 로드
  loadProducts(category1, category2, getLimit(), getSort());
};

// Limit 변경 핸들러
const handleLimitChange = (limit) => {
  setLimit(limit);
  // Limit이 변경되면 상품 목록을 다시 로드
  loadProducts(getSelectedCategory1(), getSelectedCategory2(), limit, getSort());
};

// Sort 변경 핸들러
const handleSortChange = (sort) => {
  setSort(sort);
  // Sort가 변경되면 상품 목록을 다시 로드
  loadProducts(getSelectedCategory1(), getSelectedCategory2(), getLimit(), sort);
};

// loading 변경 시 SearchBox와 ProductList 리렌더링
subscribeLoading((loading) => {
  const searchContainer = document.querySelector("#search-box-container");
  if (searchContainer) {
    searchContainer.innerHTML = SearchBox(
      loading,
      getCategories(),
      handleCategoryChange,
      handleLimitChange,
      handleSortChange,
      getLimit(),
      getSort(),
    );
  }

  const productsContainer = document.querySelector("#products-grid");
  if (productsContainer) {
    productsContainer.outerHTML = ProductList(loading, getProducts());
  }
});

// products 변경 시 ProductList만 리렌더링
subscribeProducts((products) => {
  const productsContainer = document.querySelector("#products-grid");
  if (productsContainer) {
    productsContainer.outerHTML = ProductList(getLoading(), products);
  }
});

// categories 변경 시 SearchBox만 리렌더링
subscribeCategories((categories) => {
  const searchContainer = document.querySelector("#search-box-container");
  if (searchContainer) {
    searchContainer.innerHTML = SearchBox(
      getLoading(),
      categories,
      handleCategoryChange,
      handleLimitChange,
      handleSortChange,
      getLimit(),
      getSort(),
    );
  }
});

// 상품 목록 로드 (카테고리 필터링, limit, sort 포함)
async function loadProducts(category1 = null, category2 = null, limit = 20, sort = "price_asc") {
  try {
    setLoading(true);

    const params = {
      limit,
      sort,
    };
    if (category1) params.category1 = category1;
    if (category2) params.category2 = category2;

    console.log("loadProducts with params:", params);
    const productList = await fetchProducts(params);
    console.log("productList", productList);

    setProducts(productList.products);
    setLoading(false);
  } catch (error) {
    console.error("Failed to load products:", error);
    setLoading(false);
  }
}

// 초기 데이터 로드
async function loadInitialData() {
  try {
    // 병렬로 데이터 로드
    const [productList, categoryList] = await Promise.all([fetchProducts(), fetchCategories()]);

    console.log("productList", productList);
    console.log("categoryList", categoryList);

    // 상태 업데이트
    setCategories(categoryList);
    setProducts(productList.products);
    setLoading(false);
  } catch (error) {
    console.error("Failed to load data:", error);
    setLoading(false);
  }
}

export const Home = () => {
  // DOM 마운트 후 데이터 로드
  setTimeout(() => {
    loadInitialData();
  }, 0);

  // 초기 UI 반환
  return `<main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div id="search-box-container">
          ${SearchBox(true, {}, handleCategoryChange, handleLimitChange, handleSortChange, getLimit(), getSort())}
        </div>
        <!-- 상품 목록 -->
        ${ProductList(true, [])}
      </main>`;
};
