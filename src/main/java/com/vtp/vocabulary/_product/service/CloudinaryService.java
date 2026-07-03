package com.vtp.vocabulary._product.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.vtp.vocabulary.Entity.File;
import com.vtp.vocabulary._product.repository.FileRepository;
import com.vtp.vocabulary.auth.config.CurrentUserUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;
    private final FileRepository fileRepository;

    @Transactional
    public File uploadFile(MultipartFile file) {
        invalidFile(file);
        String uploadedPublicId = null;
        try{
            String originalName = UUID.randomUUID()+"-user-" + CurrentUserUtils.getUserId() + "-" +
                            cleanFileName(file.getOriginalFilename())+ "-avatar";

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder","vocabulary/avatars",
                            "resource_type","image",
                            "public_id",originalName,
                            "overwrite", false,
                            "unique_filename", false
                    )
            );

            uploadedPublicId = uploadResult.get("public_id").toString();

            File saveFile = File.builder()
                    .url(uploadResult.get("secure_url").toString())
                    .publicId(uploadResult.get("public_id").toString())
                    .build();

            return fileRepository.save(saveFile);
        } catch (IOException e) {
            throw new RuntimeException("Không up được ảnh lên cloud", e);
        } catch (RuntimeException e) {
            if (uploadedPublicId != null) {
                deleteFileOnCloudinary(uploadedPublicId);
            }
            throw e;
        }
    }

    private void invalidFile(MultipartFile file){
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        long maxSize = 10 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new RuntimeException("Ảnh không được vượt quá 10MB");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        boolean validContentType = contentType != null &&
                contentType.startsWith("image/");

        boolean validExtension = originalFilename != null &&
                originalFilename.toLowerCase()
                        .matches(".*\\.(jpg|jpeg|png|gif|webp|jfif)$");

        if (!validContentType && !validExtension) {
            throw new RuntimeException("Chỉ cho phép upload file ảnh");
        }
    }

    private String cleanFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "unknown-file";
        }

        int dotIndex = originalFilename.lastIndexOf(".");
        String name = dotIndex == -1
                ? originalFilename
                : originalFilename.substring(0, dotIndex);

        return name
                .toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-_]", "");
    }

    public void deleteFileOnCloudinary(String publicId){
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "image")
            );
        } catch (IOException e) {
            System.err.println("Xóa file trên Cloudinary thất bại: " + publicId);
        }
    }
}
