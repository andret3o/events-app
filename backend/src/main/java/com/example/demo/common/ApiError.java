package com.example.demo.common;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiError {

    private String field;
    private String message;

    public ApiError(String field, String message) {
        this.field = field;
        this.message = message;
    }

    public ApiError(String message) {
        this.field = null;
        this.message = message;
    }
}
