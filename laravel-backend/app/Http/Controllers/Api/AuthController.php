<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        // No middleware here - we'll handle auth via route middleware
    }

    /**
     * Get a JWT via given credentials.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Register a User.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign client role by default if using Spatie's Permission
        if (method_exists($user, 'assignRole')) {
            $user->assignRole('client');
        }

        $token = auth('api')->login($user);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
        ], 201);
    }

    /**
     * Get the authenticated User.
     *
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'profile_photo_path' => $user->profile_photo_path,
        ];
        
        // Add roles if using Spatie's Permission
        if (method_exists($user, 'getRoleNames')) {
            $userData['roles'] = $user->getRoleNames();
        } else {
            $userData['roles'] = ['client']; // Default role
        }
        
        // Add permissions if using Spatie's Permission
        if (method_exists($user, 'getAllPermissions')) {
            $userData['permissions'] = $user->getAllPermissions()->pluck('name');
        } else {
            $userData['permissions'] = []; // Default permissions
        }

        return response()->json($userData);
    }

    /**
     * Update user profile
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();
            
            if (!$user) {
                \Log::error('Profile update attempted with no authenticated user');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuário não autenticado'
                ], 401);
            }
            
            \Log::info('Profile update request received', [
                'user_id' => $user->id,
                'request_data' => $request->except(['profile_photo', 'current_password', 'new_password', 'confirm_password']),
                'has_profile_photo' => $request->has('profile_photo'),
                'profile_photo_size' => $request->has('profile_photo') ? strlen($request->profile_photo) : 0
            ]);
            
            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'profile_photo' => 'nullable|string',
                'current_password' => 'nullable|string|min:6',
                'new_password' => 'nullable|string|min:8',
                'confirm_password' => 'nullable|same:new_password',
            ]);

            if ($validator->fails()) {
                \Log::warning('Profile update validation failed', [
                    'user_id' => $user->id,
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update basic info
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            
            if ($request->has('phone')) {
                $user->phone = $request->phone;
            }
            
            // Process profile photo if it's a base64 image
            if ($request->has('profile_photo') && !empty($request->profile_photo)) {
                \Log::info('Processing profile photo', [
                    'user_id' => $user->id,
                    'is_base64' => Str::startsWith($request->profile_photo, 'data:image')
                ]);
                
                if (Str::startsWith($request->profile_photo, 'data:image')) {
                    $photoPath = $this->saveBase64Image($request->profile_photo, 'avatars');
                    
                    if ($photoPath) {
                        \Log::info('Profile photo saved successfully', [
                            'user_id' => $user->id,
                            'path' => $photoPath
                        ]);
                        
                        // Delete old photo if exists
                        if ($user->profile_photo_path && Storage::disk('public')->exists(str_replace('/storage/', '', $user->profile_photo_path))) {
                            Storage::disk('public')->delete(str_replace('/storage/', '', $user->profile_photo_path));
                            \Log::info('Old profile photo deleted', [
                                'user_id' => $user->id,
                                'old_path' => $user->profile_photo_path
                            ]);
                        }
                        
                        $user->profile_photo_path = $photoPath;
                    } else {
                        \Log::error('Failed to save profile photo', [
                            'user_id' => $user->id
                        ]);
                        
                        return response()->json([
                            'success' => false,
                            'message' => 'Erro ao salvar a imagem do perfil'
                        ], 500);
                    }
                } else {
                    \Log::warning('Invalid profile photo format', [
                        'user_id' => $user->id
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Formato de imagem inválido'
                    ], 422);
                }
            }
            
            // Update password if provided
            if ($request->has('current_password') && $request->has('new_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Senha atual incorreta'
                    ], 422);
                }
                
                $user->password = Hash::make($request->new_password);
                \Log::info('User password updated', ['user_id' => $user->id]);
            }
            
            $user->save();
            
            \Log::info('Profile updated successfully', ['user_id' => $user->id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Perfil atualizado com sucesso',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_photo_path' => $user->profile_photo_path,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating profile', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save base64 image to storage and return the path
     */
    private function saveBase64Image($base64Image, $directory = 'uploads')
    {
        try {
            // Extract image data from base64 string
            $imageData = explode(',', $base64Image);
            
            if (count($imageData) !== 2) {
                \Log::error('Invalid base64 image format: wrong number of parts');
                return null;
            }
            
            // Get image extension from mime type
            $mimeHeader = substr($imageData[0], 0, strpos($imageData[0], ';'));
            if (!Str::contains($mimeHeader, ':')) {
                \Log::error('Invalid base64 image format: no mime type found', ['header' => $mimeHeader]);
                return null;
            }
            
            $mime = explode(':', $mimeHeader)[1];
            $extension = $this->getExtensionFromMime($mime);
            
            if (!$extension) {
                \Log::error('Unsupported image mime type', ['mime' => $mime]);
                return null;
            }
            
            // Decode base64 image
            $decodedImage = base64_decode($imageData[1]);
            
            if (!$decodedImage) {
                \Log::error('Failed to decode base64 image');
                return null;
            }
            
            // Generate unique filename
            $filename = Str::uuid() . '.' . $extension;
            
            // Create directory if it doesn't exist
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
                \Log::info('Created directory for images', ['directory' => $directory]);
            }
            
            // Store image in storage
            $path = $directory . '/' . $filename;
            $result = Storage::disk('public')->put($path, $decodedImage);
            
            if (!$result) {
                \Log::error('Failed to save image to storage', ['path' => $path]);
                return null;
            }
            
            \Log::info('Image saved successfully', [
                'path' => $path, 
                'size' => strlen($decodedImage),
                'extension' => $extension
            ]);
            
            // Return the relative path instead of full URL
            return '/storage/' . $path;
        } catch (\Exception $e) {
            \Log::error('Error saving base64 image', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }
    
    /**
     * Get file extension from mime type
     */
    private function getExtensionFromMime($mime)
    {
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/svg+xml' => 'svg',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];
        
        return $mimeMap[$mime] ?? null;
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    /**
     * Refresh a token.
     *
     * @return JsonResponse
     */
    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param string $token
     * @return JsonResponse
     */
    protected function respondWithToken(string $token): JsonResponse
    {
        $user = auth('api')->user();
        $userData = null;
        
        if ($user) {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'profile_photo_path' => $user->profile_photo_path,
            ];
            
            // Add roles if using Spatie's Permission
            if (method_exists($user, 'getRoleNames')) {
                $userData['roles'] = $user->getRoleNames();
            } else {
                $userData['roles'] = ['client']; // Default role for response
            }
        }

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $userData
        ]);
    }
} 