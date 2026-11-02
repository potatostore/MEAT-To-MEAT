package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.ProductCreateDTO;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.dto.product.ProductUpdateDTO;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.global.npecheck.ErrorCode;
import meat_to_meat.demo.global.npecheck.NpeCheck;
import meat_to_meat.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponseDTO createProduct(ProductCreateDTO createDTO) {
        NpeCheck.checkNotNull(createDTO, ErrorCode.PRODUCT_DTO_NULL);

        Product product = Product.builder()
                .productName(createDTO.getProductName())
                .productPrice(createDTO.getProductPrice())
                .productQuantity(createDTO.getProductQuantity())
                .description(createDTO.getDescription())
                .productCategory(createDTO.getProductCategory())
                .build();

        Product saveProduct = productRepository.save(product);
        return new ProductResponseDTO(saveProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProduct(Long productId) {
        NpeCheck.checkNotNull(productId, ErrorCode.PRODUCT_ID_NULL);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.PRODUCT_NOT_FOUND.getMessage() + " id=" + productId));

        return new ProductResponseDTO(product);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long productId, ProductUpdateDTO updateDTO) {
        NpeCheck.checkNotNull(productId, ErrorCode.PRODUCT_ID_NULL);
        NpeCheck.checkNotNull(updateDTO, ErrorCode.PRODUCT_DTO_NULL);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorCode.PRODUCT_NOT_FOUND.getMessage() + " id=" + productId));

        product.updateProductInfo(
                updateDTO.getProductName(),
                updateDTO.getProductPrice(),
                updateDTO.getProductQuantity(),
                updateDTO.getDescription(),
                updateDTO.getProductCategory()
        );
        return new ProductResponseDTO(product);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        NpeCheck.checkNotNull(productId, ErrorCode.PRODUCT_ID_NULL);

        if (!productRepository.existsById(productId)) {
            throw new IllegalStateException(ErrorCode.PRODUCT_NOT_FOUND.getMessage() + " ID: " + productId);
        }
        productRepository.deleteById(productId);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductByCategory(List<String> categories) {
        NpeCheck.checkNotNull(categories, "카테고리 목록은 null일 수 없습니다.");

        return productRepository.findAll().stream()
                .filter(product -> product.getProductCategory() != null &&
                        categories.contains(product.getProductCategory().name()))
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
    }
}