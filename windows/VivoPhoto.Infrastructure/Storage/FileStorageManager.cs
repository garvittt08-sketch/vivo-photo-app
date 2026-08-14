using System;
using System.IO;
using System.Text.RegularExpressions;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Infrastructure.Storage
{
    public class FileStorageManager
    {
        private readonly string _baseDirectory;

        public FileStorageManager(string baseDirectory = @"E:\Vivo Photo")
        {
            _baseDirectory = SanitizeAndEnsureDirectory(baseDirectory);
        }

        public string BaseDirectory => _baseDirectory;

        public string ResolveDestinationPath(string fileName, DateTime dateTaken, string mode = "Original")
        {
            string safeFileName = SanitizeFileName(fileName);
            string subFolder = mode switch
            {
                "YearMonth" => Path.Combine(dateTaken.ToString("yyyy"), dateTaken.ToString("MM")),
                "Date" => dateTaken.ToString("yyyy-MM-dd"),
                _ => string.Empty
            };

            string targetDir = string.IsNullOrEmpty(subFolder)
                ? _baseDirectory
                : Path.Combine(_baseDirectory, subFolder);

            if (!Directory.Exists(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            string fullPath = Path.GetFullPath(Path.Combine(targetDir, safeFileName));

            // Strict Path Traversal Prevention
            if (!fullPath.StartsWith(Path.GetFullPath(_baseDirectory), StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Path traversal attempt detected");
            }

            return fullPath;
        }

        public string GetTempFilePath(string sessionId)
        {
            string tempDir = Path.Combine(_baseDirectory, ".temp");
            if (!Directory.Exists(tempDir))
            {
                Directory.CreateDirectory(tempDir);
            }
            return Path.Combine(tempDir, $"{sessionId}.part");
        }

        public void FinalizeFile(string tempPath, string finalDestinationPath)
        {
            if (!File.Exists(tempPath))
                throw new FileNotFoundException("Temp file not found", tempPath);

            string? dir = Path.GetDirectoryName(finalDestinationPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            // Handle filename collision safely by appending counter if needed
            string targetPath = GetUniqueFilePath(finalDestinationPath);
            File.Move(tempPath, targetPath, overwrite: true);
        }

        public static string SanitizeFileName(string fileName)
        {
            string name = Path.GetFileName(fileName);
            string invalidChars = Regex.Escape(new string(Path.GetInvalidFileNameChars()));
            string sanitized = Regex.Replace(name, "[" + invalidChars + "]", "_");
            return string.IsNullOrWhiteSpace(sanitized) ? $"photo_{Guid.NewGuid():N}.jpg" : sanitized;
        }

        private static string SanitizeAndEnsureDirectory(string path)
        {
            try
            {
                string fullPath = Path.GetFullPath(path);
                if (!Directory.Exists(fullPath))
                {
                    Directory.CreateDirectory(fullPath);
                }
                return fullPath;
            }
            catch
            {
                // Fallback to local user folder if E:\ drive is restricted or unavailable
                string fallback = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyPictures), "Vivo Photo");
                if (!Directory.Exists(fallback))
                {
                    Directory.CreateDirectory(fallback);
                }
                return fallback;
            }
        }

        private static string GetUniqueFilePath(string filePath)
        {
            if (!File.Exists(filePath)) return filePath;

            string dir = Path.GetDirectoryName(filePath)!;
            string fileNameWithoutExt = Path.GetFileNameWithoutExtension(filePath);
            string ext = Path.GetExtension(filePath);

            int counter = 1;
            string newPath;
            do
            {
                newPath = Path.Combine(dir, $"{fileNameWithoutExt}_{counter}{ext}");
                counter++;
            } while (File.Exists(newPath));

            return newPath;
        }
    }
}
