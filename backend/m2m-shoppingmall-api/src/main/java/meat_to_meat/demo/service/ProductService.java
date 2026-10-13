package meat_to_meat.demo.service;

import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.ProductCreateDTO;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.dto.product.ProductUpdateDTO;
import meat_to_meat.demo.entity.product.Product;
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
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다." + productId));

        return new ProductResponseDTO(product);
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long productId, ProductUpdateDTO updateDTO){
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다." + productId));

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
    public void deleteProduct(Long productId){
        if(!productRepository.existsById(productId)){
            throw new IllegalStateException("존재하지 않는 상품입니다. ID: " + productId);
        }
        productRepository.deleteById(productId);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductByCategory(List<String> categories){

        return null;
    }


}
