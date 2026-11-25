package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.CategoryResponseDTO;
import meat_to_meat.demo.dto.product.PageResponseDTO;
import meat_to_meat.demo.dto.product.ProductRequestDTO;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.entity.cart.Cart;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.entity.product.ProductCategory;
import meat_to_meat.demo.global.exception.DuplicateException;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.GlobalMeatToMeatException;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.repository.CartRepository;
import meat_to_meat.demo.repository.OrderRepository;
import meat_to_meat.demo.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;

    public List<CategoryResponseDTO> getCategories() {
        return Arrays.stream(ProductCategory.values()).map(CategoryResponseDTO::from).toList();
    }

    // PROD-02 전체 조회 / PROD-06 카테고리별 조회 (+ 상품명 검색, 정렬, 페이지)
    @Transactional(readOnly = true)
    public PageResponseDTO<ProductResponseDTO> searchProducts(String category, String keyword, String sort, int page, int size) {
        ProductCategory productCategory = parseCategory(category);
        String trimmedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE), toSort(sort));
        return PageResponseDTO.of(productRepository.search(productCategory, trimmedKeyword, pageable), ProductResponseDTO::from);
    }

    // PROD-03 단건 조회 / PROD-07 상세 정보
    @Transactional(readOnly = true)
    public ProductResponseDTO getProduct(Long productId) {
        return ProductResponseDTO.from(findProduct(productId));
    }

    // PROD-01 상품 생성
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        if (productRepository.existsByProductName(request.getName())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PRODUCT_NAME);
        }
        Product product = productRepository.save(Product.builder()
                .productName(request.getName())
                .productPrice(request.getPrice())
                .productCategory(request.getCategory())
                .stockQuantity(request.getStock())
                .description(request.getDescription())
                .build());
        return ProductResponseDTO.from(product);
    }

    // PROD-04 상품 정보 변경
    @Transactional
    public ProductResponseDTO updateProduct(Long productId, ProductRequestDTO request) {
        Product product = findProduct(productId);
        if (!product.getProductName().equals(request.getName()) && productRepository.existsByProductName(request.getName())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PRODUCT_NAME);
        }
        product.updateInfo(request.getName(), request.getPrice(), request.getCategory(), request.getStock(), request.getDescription());
        return ProductResponseDTO.from(product);
    }

    // PROD-05 상품 삭제
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = findProduct(productId);

        // 1. 주문 내역에 포함된 상품은 삭제 불가 (order_item.product_id 가 ON DELETE RESTRICT)
        if (orderRepository.existsByOrderItems_Product_ProductId(productId)) {
            throw new GlobalMeatToMeatException(ErrorCode.CANNOT_DELETE_ORDERED_PRODUCT, "productId=" + productId);
        }

        // 2. 장바구니에 담긴 해당 상품을 먼저 제거
        for (Cart cart : cartRepository.findAll()) {
            cart.getCartItems().removeIf(item -> item.getProduct().getProductId().equals(productId));
        }
        cartRepository.flush();

        // 3. FK 참조가 끊긴 뒤 상품 삭제
        productRepository.delete(product);
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "id=" + productId));
    }

    private ProductCategory parseCategory(String category) {
        if (category == null || category.isBlank()) return null;
        try {
            return ProductCategory.valueOf(category);
        } catch (IllegalArgumentException e) {
            throw new GlobalMeatToMeatException(ErrorCode.INVALID_CATEGORY, category);
        }
    }

    // 프론트의 sort 값: newest(기본) | price_asc | price_desc | name
    private Sort toSort(String sort) {
        Sort tieBreaker = Sort.by(Sort.Direction.DESC, "productId");
        if (sort == null) sort = "newest";
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "productPrice").and(tieBreaker);
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "productPrice").and(tieBreaker);
            case "name" -> Sort.by(Sort.Direction.ASC, "productName");
            default -> Sort.by(Sort.Direction.DESC, "createAt").and(tieBreaker);
        };
    }
}
