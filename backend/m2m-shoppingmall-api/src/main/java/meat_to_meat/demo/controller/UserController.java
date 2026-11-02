package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.user.UserCreateDTO;
import meat_to_meat.demo.dto.user.UserResponseDTO;
import meat_to_meat.demo.dto.user.UserUpdateDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(UrlNames.userBase)
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping(value = UrlNames.createUser)
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreateDTO createDTO) {
        return ResponseEntity.ok(userService.createUser(createDTO));
    }

    @GetMapping(value = UrlNames.getAllUsers)
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping(value = UrlNames.getUser)
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @PatchMapping(value = UrlNames.updateUser)
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UserUpdateDTO updateDTO) {
        return ResponseEntity.ok(userService.updateUser(userId, updateDTO));
    }

    @DeleteMapping(value = UrlNames.deleteUser)
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}