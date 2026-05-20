package com.example.demo.security;

import com.example.demo.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {
        // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");

        // 1. Set the content type to JSON
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // 2. Set the status code to 401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // 3. Create your custom error object
        ApiResponse<Object> apiResponse = ApiResponse.error("Error: Please login to access this resource");

        // 4. Write the object as JSON to the response body
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
