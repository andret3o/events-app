package com.example.demo.cloud;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public Map uploadFile(MultipartFile file, String folderName) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folderName,
                "resource_type", "auto"
        ));
    }

    public Map deleteFile(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    // Helper

    public String extractPublicId(String url) {
        if (url == null || !url.contains("upload/")) {
            return null;
        }

        String remainingPath = url.split("/upload/")[1];

        // Remove version number (e.g., "v1623456/folder/img")
        if (remainingPath.startsWith("v")) {
            remainingPath = remainingPath.substring(remainingPath.indexOf("/") + 1);
        }

        // Remove the file extension (e.g., ".jpg", ".png")
        int extensionIndex = remainingPath.lastIndexOf(".");
        if (extensionIndex != -1) {
            return remainingPath.substring(0, extensionIndex);
        }

        return remainingPath;
    }
}
