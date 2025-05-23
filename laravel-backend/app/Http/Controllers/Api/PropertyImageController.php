<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PropertyImageController extends Controller
{
    /**
     * Constructor.
     */
    public function __construct()
    {
        // Middleware is applied in the routes file
    }

    /**
     * Upload de imagens para um imóvel.
     *
     * @param Request $request
     * @param Property $property
     * @return JsonResponse
     */
    public function upload(Request $request, Property $property): JsonResponse
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp,avif|max:5120', // 5MB
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'convert_to_avif' => 'nullable|string|in:true,false,0,1',
        ]);

        $uploadedImages = [];
        $manager = new ImageManager(new Driver());
        $convertToAvif = $request->input('convert_to_avif') === 'true' || $request->input('convert_to_avif') === '1';

        foreach ($request->file('images') as $image) {
            try {
                // Determine the extension based on the original file
                $originalExtension = strtolower($image->getClientOriginalExtension());
                $extension = $originalExtension;
                
                // If converting to AVIF is requested, use JPG instead since AVIF support is limited
                if ($convertToAvif) {
                    $extension = 'jpg';
                }
                
                // Generate a unique filename
                $filename = Str::uuid() . '.' . $extension;
                
                // Relative path to store the image
                $path = 'properties/' . $property->id;
                
                // Create directory if it doesn't exist
                if (!Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->makeDirectory($path);
                }
                
                // Load the image using Intervention Image
                $img = $manager->read($image);
                
                // Resize the image to limit its maximum size
                $img->scaleDown(width: 1920, height: 1080);
                
                // Encode the image based on its extension
                $encodedImage = null;
                switch ($extension) {
                    case 'png':
                        $encodedImage = $img->toPng();
                        $mimeType = 'image/png';
                        break;
                    case 'webp':
                        $encodedImage = $img->toWebp();
                        $mimeType = 'image/webp';
                        break;
                    default:
                        // Default to JPEG for all other formats
                        $encodedImage = $img->toJpeg(90);
                        $mimeType = 'image/jpeg';
                        break;
                }
                
                // Save the resized image
                Storage::disk('public')->put($path . '/' . $filename, $encodedImage);
                
                // Create thumbnail
                $thumbnail = $manager->read($image);
                $thumbnail->cover(width: 300, height: 200);
                
                // Encode thumbnail with the same format as the main image
                $encodedThumbnail = null;
                switch ($extension) {
                    case 'png':
                        $encodedThumbnail = $thumbnail->toPng();
                        break;
                    case 'webp':
                        $encodedThumbnail = $thumbnail->toWebp();
                        break;
                    default:
                        $encodedThumbnail = $thumbnail->toJpeg(90);
                        break;
                }
                
                // Save thumbnail
                $thumbnailFilename = pathinfo($filename, PATHINFO_FILENAME) . '_thumb.' . $extension;
                Storage::disk('public')->put($path . '/' . $thumbnailFilename, $encodedThumbnail);
                
                // Get the last order for this property
                $lastOrder = PropertyImage::where('property_id', $property->id)
                    ->max('order') ?? 0;
                
                // Save the image record in the database
                $propertyImage = PropertyImage::create([
                    'property_id' => $property->id,
                    'title' => $request->input('title', $property->title),
                    'description' => $request->input('description'),
                    'file_path' => $path . '/' . $filename,
                    'file_name' => $filename,
                    'file_size' => $image->getSize(),
                    'file_type' => $mimeType,
                    'order' => $lastOrder + 1,
                    'is_featured' => !PropertyImage::where('property_id', $property->id)->exists(), // First image as featured
                ]);
                
                // Add explicit URL and thumbnail_url
                $imageData = $propertyImage->toArray();
                $imageData['url'] = url('/storage/' . $path . '/' . $filename);
                $imageData['thumbnail_url'] = url('/storage/' . $path . '/' . $thumbnailFilename);
                
                $uploadedImages[] = $imageData;
            } catch (\Exception $e) {
                \Log::error('Error uploading image', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao processar imagem: ' . $e->getMessage()
                ], 500);
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($uploadedImages) . ' imagens foram enviadas com sucesso',
            'data' => $uploadedImages
        ]);
    }

    /**
     * Marca ou desmarca uma imagem como destaque.
     *
     * @param PropertyImage $image
     * @return JsonResponse
     */
    public function toggleFeatured(PropertyImage $image): JsonResponse
    {
        // Se estamos marcando como destaque, desmarcamos qualquer outra imagem destacada
        if (!$image->is_featured) {
            PropertyImage::where('property_id', $image->property_id)
                ->where('is_featured', true)
                ->update(['is_featured' => false]);
        }

        $image->is_featured = !$image->is_featured;
        $image->save();

        return response()->json([
            'success' => true,
            'message' => $image->is_featured ? 'Imagem definida como destaque' : 'Imagem removida do destaque',
            'data' => $image
        ]);
    }

    /**
     * Atualiza a ordem de uma imagem.
     *
     * @param Request $request
     * @param PropertyImage $image
     * @return JsonResponse
     */
    public function updateOrder(Request $request, PropertyImage $image): JsonResponse
    {
        $request->validate([
            'order' => 'required|integer|min:1',
        ]);

        $newOrder = $request->order;
        $currentOrder = $image->order;
        $propertyId = $image->property_id;

        // Ajustar a ordem de outras imagens se necessário
        if ($newOrder > $currentOrder) {
            // Movendo para baixo: ajustar imagens entre a ordem atual e a nova
            PropertyImage::where('property_id', $propertyId)
                ->where('order', '>', $currentOrder)
                ->where('order', '<=', $newOrder)
                ->decrement('order');
        } else if ($newOrder < $currentOrder) {
            // Movendo para cima: ajustar imagens entre a nova ordem e a atual
            PropertyImage::where('property_id', $propertyId)
                ->where('order', '>=', $newOrder)
                ->where('order', '<', $currentOrder)
                ->increment('order');
        }

        // Atualizar a ordem da imagem atual
        $image->order = $newOrder;
        $image->save();

        return response()->json([
            'success' => true,
            'message' => 'Ordem da imagem atualizada com sucesso',
            'data' => $image
        ]);
    }

    /**
     * Reordena múltiplas imagens de uma propriedade de uma vez.
     *
     * @param Request $request
     * @param Property $property
     * @return JsonResponse
     */
    public function reorderImages(Request $request, Property $property): JsonResponse
    {
        $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'required|integer|exists:property_images,id',
        ]);

        $imageIds = $request->image_ids;
        
        // Verificar se todas as imagens pertencem à propriedade
        $imagesCount = PropertyImage::where('property_id', $property->id)
            ->whereIn('id', $imageIds)
            ->count();
            
        if ($imagesCount !== count($imageIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Algumas imagens não pertencem a esta propriedade'
            ], 400);
        }
        
        // Atualizar a ordem de cada imagem
        foreach ($imageIds as $index => $imageId) {
            PropertyImage::where('id', $imageId)->update(['order' => $index + 1]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Ordem das imagens atualizada com sucesso'
        ]);
    }

    /**
     * Remove uma imagem.
     *
     * @param PropertyImage $image
     * @return JsonResponse
     */
    public function destroy(PropertyImage $image): JsonResponse
    {
        // Verificar se é a imagem destacada
        $isFeatured = $image->is_featured;
        $propertyId = $image->property_id;

        // Remover arquivos do storage
        if (Storage::disk('public')->exists($image->file_path)) {
            Storage::disk('public')->delete($image->file_path);
            
            // Remover thumbnail
            $pathInfo = pathinfo($image->file_path);
            $thumbnailPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
            
            if (Storage::disk('public')->exists($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }
        }

        // Remover registro do banco de dados
        $image->delete();

        // Reordenar as imagens restantes
        PropertyImage::where('property_id', $propertyId)
            ->where('order', '>', $image->order)
            ->decrement('order');

        // Se a imagem removida era destaque, definir outra como destaque
        if ($isFeatured) {
            $firstImage = PropertyImage::where('property_id', $propertyId)
                ->orderBy('order')
                ->first();

            if ($firstImage) {
                $firstImage->is_featured = true;
                $firstImage->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Imagem removida com sucesso'
        ]);
    }
} 