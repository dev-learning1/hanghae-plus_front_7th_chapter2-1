export const GoToProductList = () => {
  const basePath = import.meta.env.BASE_URL;

  return `
      <div class="mb-6">
        <a href="${basePath}" data-link class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
          hover:bg-gray-200 transition-colors go-to-product-list">
          상품 목록으로 돌아가기
        </a>
      </div>
    `;
};
