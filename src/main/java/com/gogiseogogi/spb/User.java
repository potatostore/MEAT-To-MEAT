package com.gogiseogogi.spb;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true)
    private String userPw;

    @Column(unique = true)
    private String name;

    @Column(unique = true)
    private String birthday;

    @Column(unique = true, nullable = false)
    private String loginId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String phoneNumber;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sex sex;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}

