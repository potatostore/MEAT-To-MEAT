package meat_to_meat.demo.controller;


import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.product.ProductResponseDTO;
import meat_to_meat.demo.dto.product.ProductCreateDTO;
import meat_to_meat.demo.dto.product.ProductUpdateDTO;
import meat_to_meat.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "https://localhost:3000")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/create")
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody ProductCreateDTO createDTO){
        return ResponseEntity.ok(productService.createProduct(createDTO));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(){
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{product_id}")
    public ResponseEntity<ProductResponseDTO> getProduct(@PathVariable("product_id") Long productId){
        return ResponseEntity.ok(productService.getProduct(productId));
    }

    @GetMapping("/category")
    public ResponseEntity<List<ProductResponseDTO>> getAllProductsByCategory(@RequestParam("categories") List<String> categories){
        return ResponseEntity.ok(productService.getProductByCategory(categories));
    }

    @PatchMapping("/{product_id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable("product_id") Long productId,
            @RequestBody ProductUpdateDTO updateDTO) {
        return ResponseEntity.ok(productService.updateProduct(productId, updateDTO));
    }

    @DeleteMapping("{product_id}")
    public ResponseEntity<ProductResponseDTO> deleteProduct(@PathVariable("product_id") Long productId){
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
