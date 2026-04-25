/**
 * Defines the contract for a service that can compress and resize images.
 */
export interface ImageCompressionService {
    /**
     * Compresses and resizes an image file.
     * @param file The original image file.
     * @param quality The compression quality (0 to 1).
     * @param maxWidth The maximum width of the resulting image.
     * @param maxHeight The maximum height of the resulting image.
     * @returns A promise that resolves to the compressed image file.
     */
    compress(file: File, quality: number, maxWidth: number, maxHeight: number): Promise<File>;
}
