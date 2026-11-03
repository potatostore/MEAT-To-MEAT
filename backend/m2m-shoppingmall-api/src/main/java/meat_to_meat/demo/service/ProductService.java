package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.ProductCreateDTO;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.dto.product.ProductUpdateDTO;
import meat_to_meat.demo.entity.product.Product;
import meat_to_meat.demo.global.exception.DuplicateException;
import meat_to_meat.demo.global.exception.ErrorCode;
import meat_to_meat.demo.global.exception.NotFoundException;
import meat_to_meat.demo.global.exception.NpeCheck;
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

        if (productRepository.existsByProductName(createDTO.getProductName())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PRODUCT_NAME);
        }

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
                .orElseThrow(() -> new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "id=" + productId));

        return new ProductResponseDTO(product);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long productId, ProductUpdateDTO updateDTO) {
        NpeCheck.checkNotNull(productId, ErrorCode.PRODUCT_ID_NULL);
        NpeCheck.checkNotNull(updateDTO, ErrorCode.PRODUCT_DTO_NULL);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "id=" + productId));

        if (!product.getProductName().equals(updateDTO.getProductName())
                && productRepository.existsByProductName(updateDTO.getProductName())) {
            throw new DuplicateException(ErrorCode.DUPLICATE_PRODUCT_NAME);
        }

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

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "id=" + productId));
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductByCategory(List<String> categories) {
        NpeCheck.checkNotNull(categories, ErrorCode.CATEGORY_LIST_NULL);

        return productRepository.findAll().stream()
                .filter(product -> product.getProductCategory() != null &&
                        product.getProductCategory().stream().anyMatch(categories::contains))
                .map(ProductResponseDTO::new)
                .collect(Collectors.toList());
    }
}