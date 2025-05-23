<?php

namespace App\Http\Controllers\Api;

use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PropertyController extends ApiController
{
    /**
     * Cria uma nova instância do controller.
     *
     * @return void
     */
    public function __construct()
    {
        // Middleware should be defined in the routes file
    }

    /**
     * Lista todos os imóveis com filtros e paginação.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $orderBy = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        $query = Property::with(['propertyType', 'city', 'neighborhood', 'features'])
            ->where('active', true);

        // Filtros
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('neighborhood_id')) {
            $query->where('neighborhood_id', $request->neighborhood_id);
        }

        if ($request->has('property_type_id')) {
            $query->where('property_type_id', $request->property_type_id);
        }

        if ($request->has('purpose')) {
            $query->where('purpose', $request->purpose);
        }

        if ($request->has('bedrooms')) {
            $query->where('bedrooms', '>=', $request->bedrooms);
        }

        if ($request->has('bathrooms')) {
            $query->where('bathrooms', '>=', $request->bathrooms);
        }

        if ($request->has('parking_spaces')) {
            $query->where('parking_spaces', '>=', $request->parking_spaces);
        }

        if ($request->has('furnished')) {
            $query->where('furnished', $request->furnished);
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->featured);
        }

        // Filtros de preço
        if ($request->has('min_price')) {
            $query->where(function ($q) use ($request) {
                $q->where(function ($q1) use ($request) {
                    $q1->where('purpose', 'sale')
                        ->where('sale_price', '>=', $request->min_price);
                })->orWhere(function ($q2) use ($request) {
                    $q2->where('purpose', 'rent')
                        ->where('rent_price', '>=', $request->min_price);
                })->orWhere(function ($q3) use ($request) {
                    $q3->where('purpose', 'both')
                        ->where(function ($q4) use ($request) {
                            $q4->where('sale_price', '>=', $request->min_price)
                                ->orWhere('rent_price', '>=', $request->min_price);
                        });
                });
            });
        }

        if ($request->has('max_price')) {
            $query->where(function ($q) use ($request) {
                $q->where(function ($q1) use ($request) {
                    $q1->where('purpose', 'sale')
                        ->where('sale_price', '<=', $request->max_price);
                })->orWhere(function ($q2) use ($request) {
                    $q2->where('purpose', 'rent')
                        ->where('rent_price', '<=', $request->max_price);
                })->orWhere(function ($q3) use ($request) {
                    $q3->where('purpose', 'both')
                        ->where(function ($q4) use ($request) {
                            $q4->where('sale_price', '<=', $request->max_price)
                                ->orWhere('rent_price', '<=', $request->max_price);
                        });
                });
            });
        }

        // Filtros de área
        if ($request->has('min_area')) {
            $query->where('area', '>=', $request->min_area);
        }

        if ($request->has('max_area')) {
            $query->where('area', '<=', $request->max_area);
        }

        // Ordenação
        $query->orderBy($orderBy, $order);

        $properties = $query->paginate($perPage);

        // Se não houver imóveis, retornar dados mockados
        if ($properties->isEmpty()) {
            $mockProperties = $this->getMockProperties();
            
            return $this->respond([
                'success' => true,
                'properties' => $mockProperties,
                'pagination' => [
                    'total_count' => count($mockProperties),
                    'total_pages' => 1,
                    'current_page' => 1,
                    'per_page' => count($mockProperties),
                    'links' => [
                        'next' => null,
                        'prev' => null,
                        'first' => null,
                        'last' => null,
                    ]
                ]
            ]);
        }

        // Adicionar URLs de imagens
        $properties->getCollection()->transform(function ($property) {
            try {
                $property->main_photo = $property->getFirstMediaUrl('photos');
                $property->photos = $property->getMedia('photos')->map(function ($media) {
                    return $media->getUrl();
                });
            } catch (\Exception $e) {
                // Se houver erro ao obter mídia, definir valores padrão
                $property->main_photo = null;
                $property->photos = [];
            }
            return $property;
        });

        return $this->respondWithPagination($properties, [
            'success' => true,
            'properties' => $properties->items()
        ]);
    }

    /**
     * Retorna dados mockados de imóveis para demonstração
     * 
     * @return array
     */
    private function getMockProperties(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'Apartamento Luxuoso em Jardins',
                'description' => 'Lindo apartamento com 3 quartos, 2 banheiros, varanda gourmet e vista panorâmica.',
                'purpose' => 'sale',
                'sale_price' => 1200000,
                'rent_price' => null,
                'address' => 'Rua Oscar Freire, 123',
                'neighborhood' => ['id' => 1, 'name' => 'Jardins'],
                'city' => ['id' => 1, 'name' => 'São Paulo'],
                'state' => ['abbreviation' => 'SP'],
                'bedrooms' => 3,
                'bathrooms' => 2,
                'area' => 120,
                'parking_spaces' => 2,
                'property_type' => ['id' => 1, 'name' => 'Apartamento'],
                'status' => 'active',
                'main_photo' => 'https://picsum.photos/id/1/800/600',
                'photos' => [
                    'https://picsum.photos/id/1/800/600',
                    'https://picsum.photos/id/20/800/600',
                    'https://picsum.photos/id/30/800/600',
                ],
                'created_at' => '2023-01-15T10:00:00',
                'updated_at' => '2023-01-15T10:00:00',
            ],
            [
                'id' => 2,
                'title' => 'Casa com Piscina em Alphaville',
                'description' => 'Excelente casa em condomínio fechado, com 4 suítes, piscina, churrasqueira e jardim.',
                'purpose' => 'both',
                'sale_price' => 2500000,
                'rent_price' => 8000,
                'address' => 'Alameda dos Ipês, 500',
                'neighborhood' => ['id' => 2, 'name' => 'Alphaville'],
                'city' => ['id' => 2, 'name' => 'Barueri'],
                'state' => ['abbreviation' => 'SP'],
                'bedrooms' => 4,
                'bathrooms' => 5,
                'area' => 350,
                'parking_spaces' => 4,
                'property_type' => ['id' => 2, 'name' => 'Casa'],
                'status' => 'active',
                'main_photo' => 'https://picsum.photos/id/10/800/600',
                'photos' => [
                    'https://picsum.photos/id/10/800/600',
                    'https://picsum.photos/id/11/800/600',
                    'https://picsum.photos/id/12/800/600',
                ],
                'created_at' => '2023-01-20T14:30:00',
                'updated_at' => '2023-01-20T14:30:00',
            ],
            [
                'id' => 3,
                'title' => 'Cobertura Duplex na Barra da Tijuca',
                'description' => 'Espetacular cobertura duplex com vista para o mar, 3 suítes, terraço com piscina e churrasqueira.',
                'purpose' => 'rent',
                'sale_price' => null,
                'rent_price' => 12000,
                'address' => 'Avenida Lúcio Costa, 1500',
                'neighborhood' => ['id' => 3, 'name' => 'Barra da Tijuca'],
                'city' => ['id' => 3, 'name' => 'Rio de Janeiro'],
                'state' => ['abbreviation' => 'RJ'],
                'bedrooms' => 3,
                'bathrooms' => 4,
                'area' => 280,
                'parking_spaces' => 3,
                'property_type' => ['id' => 3, 'name' => 'Cobertura'],
                'status' => 'active',
                'main_photo' => 'https://picsum.photos/id/13/800/600',
                'photos' => [
                    'https://picsum.photos/id/13/800/600',
                    'https://picsum.photos/id/14/800/600',
                    'https://picsum.photos/id/15/800/600',
                ],
                'created_at' => '2023-02-05T09:15:00',
                'updated_at' => '2023-02-05T09:15:00',
            ],
            [
                'id' => 4,
                'title' => 'Sala Comercial no Centro',
                'description' => 'Sala comercial de 50m² em prédio moderno com recepção, segurança 24h e estacionamento.',
                'purpose' => 'both',
                'sale_price' => 450000,
                'rent_price' => 3500,
                'address' => 'Avenida Paulista, 1000',
                'neighborhood' => ['id' => 4, 'name' => 'Bela Vista'],
                'city' => ['id' => 1, 'name' => 'São Paulo'],
                'state' => ['abbreviation' => 'SP'],
                'bedrooms' => 0,
                'bathrooms' => 1,
                'area' => 50,
                'parking_spaces' => 1,
                'property_type' => ['id' => 4, 'name' => 'Comercial'],
                'status' => 'active',
                'main_photo' => 'https://picsum.photos/id/16/800/600',
                'photos' => [
                    'https://picsum.photos/id/16/800/600',
                    'https://picsum.photos/id/17/800/600',
                ],
                'created_at' => '2023-02-10T11:45:00',
                'updated_at' => '2023-02-10T11:45:00',
            ],
            [
                'id' => 5,
                'title' => 'Studio Moderno em Pinheiros',
                'description' => 'Studio compacto e moderno, totalmente mobiliado, próximo ao metrô e diversas opções de lazer.',
                'purpose' => 'rent',
                'sale_price' => null,
                'rent_price' => 2800,
                'address' => 'Rua dos Pinheiros, 500',
                'neighborhood' => ['id' => 5, 'name' => 'Pinheiros'],
                'city' => ['id' => 1, 'name' => 'São Paulo'],
                'state' => ['abbreviation' => 'SP'],
                'bedrooms' => 1,
                'bathrooms' => 1,
                'area' => 35,
                'parking_spaces' => 0,
                'property_type' => ['id' => 5, 'name' => 'Studio'],
                'status' => 'active',
                'main_photo' => 'https://picsum.photos/id/18/800/600',
                'photos' => [
                    'https://picsum.photos/id/18/800/600',
                    'https://picsum.photos/id/19/800/600',
                ],
                'created_at' => '2023-02-15T16:20:00',
                'updated_at' => '2023-02-15T16:20:00',
            ],
        ];
    }

    /**
     * Armazena um novo imóvel.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Verificar permissões
        if (!Auth::user()->can('create properties')) {
            return $this->respondForbidden('Você não tem permissão para criar imóveis');
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'property_type_id' => 'required|exists:property_types,id',
            'purpose' => ['required', Rule::in(['sale', 'rent', 'both'])],
            'sale_price' => 'nullable|required_if:purpose,sale,both|numeric|min:0',
            'rent_price' => 'nullable|required_if:purpose,rent,both|numeric|min:0',
            'condominium_fee' => 'nullable|numeric|min:0',
            'iptu' => 'nullable|numeric|min:0',
            'address' => 'required|string|max:200',
            'address_number' => 'nullable|string|max:20',
            'address_complement' => 'nullable|string|max:50',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
            'city_id' => 'required|exists:cities,id',
            'state' => 'required|string|size:2',
            'zip_code' => 'nullable|string|max:9',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'suites' => 'nullable|integer|min:0',
            'parking_spaces' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'total_area' => 'nullable|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'furnished' => 'nullable|boolean',
            'facing' => 'nullable|string|max:50',
            'owner_id' => 'required|exists:people,id',
            'agent_id' => 'nullable|exists:people,id',
            'status' => ['nullable', Rule::in(['available', 'sold', 'rented', 'reserved', 'unavailable'])],
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date',
            'featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:100',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:150',
            'active' => 'nullable|boolean',
            'features' => 'nullable|array',
            'features.*' => 'exists:features,id',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return $this->respondValidationErrors($validator->errors()->toArray());
        }

        try {
            DB::beginTransaction();

            // Gerar código único para o imóvel
            $prefix = strtoupper(substr($request->purpose, 0, 1)); // S, R ou B
            $uniqueNumber = mt_rand(10000, 99999);
            $code = $prefix . '-' . $uniqueNumber;

            // Verificar se o código já existe e tentar novamente se necessário
            while (Property::where('code', $code)->exists()) {
                $uniqueNumber = mt_rand(10000, 99999);
                $code = $prefix . '-' . $uniqueNumber;
            }

            // Criar o slug a partir do título
            $slug = Str::slug($request->title) . '-' . $uniqueNumber;

            // Criar o imóvel
            $property = new Property($request->all());
            $property->code = $code;
            $property->slug = $slug;
            $property->created_by = Auth::id();
            $property->save();

            // Adicionar características (features)
            if ($request->has('features')) {
                $property->features()->attach($request->features);
            }

            // Processar fotos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $property->addMedia($photo)
                        ->usingFileName(time() . '_' . $photo->getClientOriginalName())
                        ->toMediaCollection('photos');
                }
            }

            DB::commit();

            // Carregar relações
            $property->load(['propertyType', 'city', 'neighborhood', 'features', 'owner', 'agent']);

            // Adicionar URLs de imagens
            $property->main_photo = $property->getFirstMediaUrl('photos');
            $property->photos = $property->getMedia('photos')->map(function ($media) {
                return $media->getUrl();
            });

            return $this->respondCreated([
                'success' => true,
                'message' => 'Imóvel criado com sucesso',
                'property' => $property
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->respondInternalError('Erro ao criar imóvel: ' . $e->getMessage());
        }
    }

    /**
     * Exibe um imóvel específico.
     *
     * @param string $id Pode ser o ID numérico ou o slug do imóvel
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            // Log para depuração
            \Log::info("Buscando propriedade com ID/slug: {$id}");
            
            $query = Property::with(['propertyType', 'city', 'neighborhood', 'features', 'owner', 'agent', 'propertyImages']);

            if (is_numeric($id)) {
                $property = $query->findOrFail($id);
                \Log::info("Propriedade encontrada por ID: {$id}");
            } else {
                $property = $query->where('slug', $id)->firstOrFail();
                \Log::info("Propriedade encontrada por slug: {$id}");
            }

            // Incrementar contador de visualizações
            $property->increment('views');
            
            // Log dos dados da propriedade
            \Log::info("Dados da propriedade:", ['property_id' => $property->id, 'property_type_id' => $property->property_type_id]);
            
            // Verificar se as relações foram carregadas corretamente
            \Log::info("Relações carregadas:", [
                'property_type' => $property->propertyType ? true : false,
                'city' => $property->city ? true : false,
                'neighborhood' => $property->neighborhood ? true : false,
                'features_count' => $property->features ? $property->features->count() : 0,
                'owner' => $property->owner ? true : false,
                'agent' => $property->agent ? true : false,
                'property_images_count' => $property->propertyImages ? $property->propertyImages->count() : 0,
            ]);

            // Adicionar URLs de imagens
            try {
                // Carregar imagens do Spatie Media Library
                $property->main_photo = $property->getFirstMediaUrl('photos');
                $property->photos = $property->getMedia('photos')->map(function ($media) {
                    return $media->getUrl();
                });
                
                // Carregar imagens do modelo PropertyImage com URLs
                if ($property->propertyImages && $property->propertyImages->count() > 0) {
                    $property->property_images = $property->propertyImages->map(function ($image) {
                        // Ensure URLs are always included
                        $url = $image->getUrl();
                        $thumbnailUrl = $image->getThumbnailUrl();
                        
                        // Log URLs for debugging
                        \Log::debug("Image URLs for property image {$image->id}", [
                            'url' => $url,
                            'thumbnail_url' => $thumbnailUrl,
                            'file_path' => $image->file_path
                        ]);
                        
                        return [
                            'id' => $image->id,
                            'property_id' => $image->property_id,
                            'title' => $image->title,
                            'description' => $image->description,
                            'file_path' => $image->file_path,
                            'file_name' => $image->file_name,
                            'order' => $image->order,
                            'is_featured' => $image->is_featured,
                            'url' => $url,
                            'thumbnail_url' => $thumbnailUrl,
                        ];
                    });
                    
                    // Definir a imagem de capa
                    $featuredImage = $property->propertyImages->where('is_featured', true)->first();
                    if ($featuredImage) {
                        $property->featured_image = [
                            'id' => $featuredImage->id,
                            'url' => $featuredImage->getUrl(),
                            'thumbnail_url' => $featuredImage->getThumbnailUrl(),
                        ];
                    }
                } else {
                    $property->property_images = [];
                    $property->featured_image = null;
                }
                
                \Log::info("Mídia carregada com sucesso. Total de fotos: " . count($property->photos));
            } catch (\Exception $e) {
                // Se houver erro ao obter mídia, definir valores padrão
                \Log::error("Erro ao carregar mídia: " . $e->getMessage());
                $property->main_photo = null;
                $property->photos = [];
                $property->property_images = [];
                $property->featured_image = null;
            }

            // Formatar os dados para o frontend
            $formattedProperty = $property->toArray();
            
            // Garantir que o property_type_id esteja presente
            if (!isset($formattedProperty['property_type_id']) && isset($formattedProperty['property_type']['id'])) {
                $formattedProperty['property_type_id'] = $formattedProperty['property_type']['id'];
                \Log::info("Adicionado property_type_id: " . $formattedProperty['property_type_id']);
            }
            
            // Garantir que o city_id esteja presente
            if (!isset($formattedProperty['city_id']) && isset($formattedProperty['city']['id'])) {
                $formattedProperty['city_id'] = $formattedProperty['city']['id'];
                \Log::info("Adicionado city_id: " . $formattedProperty['city_id']);
            }
            
            // Garantir que o neighborhood_id esteja presente
            if (!isset($formattedProperty['neighborhood_id']) && isset($formattedProperty['neighborhood']['id'])) {
                $formattedProperty['neighborhood_id'] = $formattedProperty['neighborhood']['id'];
                \Log::info("Adicionado neighborhood_id: " . $formattedProperty['neighborhood_id']);
            }
            
            // Garantir que o owner_id esteja presente
            if (!isset($formattedProperty['owner_id']) && isset($formattedProperty['owner']['id'])) {
                $formattedProperty['owner_id'] = $formattedProperty['owner']['id'];
                \Log::info("Adicionado owner_id: " . $formattedProperty['owner_id']);
            }
            
            // Garantir que o agent_id esteja presente
            if (!isset($formattedProperty['agent_id']) && isset($formattedProperty['agent']['id'])) {
                $formattedProperty['agent_id'] = $formattedProperty['agent']['id'];
                \Log::info("Adicionado agent_id: " . $formattedProperty['agent_id']);
            }
            
            // Formatar características (features) para o formato esperado pelo frontend
            if (isset($formattedProperty['features']) && is_array($formattedProperty['features'])) {
                $originalFeatures = $formattedProperty['features'];
                $formattedProperty['features'] = array_map(function($feature) {
                    return $feature['id'];
                }, $formattedProperty['features']);
                \Log::info("Features formatadas: ", [
                    'original' => $originalFeatures,
                    'formatted' => $formattedProperty['features']
                ]);
            } else {
                \Log::warning("Features não encontradas ou não são um array");
                $formattedProperty['features'] = [];
            }
            
            // Verificar se todos os campos necessários estão presentes
            $requiredFields = ['property_type_id', 'city_id', 'neighborhood_id', 'owner_id'];
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (!isset($formattedProperty[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                \Log::warning("Campos obrigatórios ausentes: " . implode(', ', $missingFields));
            }

            return $this->respond([
                'success' => true,
                'property' => $formattedProperty
            ]);
        } catch (\Exception $e) {
            \Log::error("Erro ao buscar propriedade: " . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->respondNotFound('Imóvel não encontrado: ' . $e->getMessage());
        }
    }

    /**
     * Atualiza um imóvel específico.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Verificar permissões
        if (!Auth::user()->can('edit properties')) {
            return $this->respondForbidden('Você não tem permissão para editar imóveis');
        }

        try {
            $property = Property::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:200',
                'description' => 'sometimes|required|string',
                'property_type_id' => 'sometimes|required|exists:property_types,id',
                'purpose' => ['sometimes', 'required', Rule::in(['sale', 'rent', 'both'])],
                'sale_price' => 'sometimes|nullable|required_if:purpose,sale,both|numeric|min:0',
                'rent_price' => 'sometimes|nullable|required_if:purpose,rent,both|numeric|min:0',
                'condominium_fee' => 'sometimes|nullable|numeric|min:0',
                'iptu' => 'sometimes|nullable|numeric|min:0',
                'address' => 'sometimes|required|string|max:200',
                'address_number' => 'sometimes|nullable|string|max:20',
                'address_complement' => 'sometimes|nullable|string|max:50',
                'neighborhood_id' => 'sometimes|required|exists:neighborhoods,id',
                'city_id' => 'sometimes|required|exists:cities,id',
                'state' => 'sometimes|required|string|size:2',
                'zip_code' => 'sometimes|nullable|string|max:9',
                'latitude' => 'sometimes|nullable|numeric',
                'longitude' => 'sometimes|nullable|numeric',
                'bedrooms' => 'sometimes|nullable|integer|min:0',
                'bathrooms' => 'sometimes|nullable|integer|min:0',
                'suites' => 'sometimes|nullable|integer|min:0',
                'parking_spaces' => 'sometimes|nullable|integer|min:0',
                'area' => 'sometimes|nullable|numeric|min:0',
                'total_area' => 'sometimes|nullable|numeric|min:0',
                'floor' => 'sometimes|nullable|integer|min:0',
                'furnished' => 'sometimes|nullable|boolean',
                'facing' => 'sometimes|nullable|string|max:50',
                'owner_id' => 'sometimes|required|exists:people,id',
                'agent_id' => 'sometimes|nullable|exists:people,id',
                'status' => ['sometimes', 'nullable', Rule::in(['available', 'sold', 'rented', 'reserved', 'unavailable'])],
                'available_from' => 'sometimes|nullable|date',
                'available_until' => 'sometimes|nullable|date',
                'featured' => 'sometimes|nullable|boolean',
                'meta_title' => 'sometimes|nullable|string|max:100',
                'meta_description' => 'sometimes|nullable|string|max:255',
                'meta_keywords' => 'sometimes|nullable|string|max:150',
                'active' => 'sometimes|nullable|boolean',
                'features' => 'sometimes|nullable|array',
                'features.*' => 'exists:features,id',
                'photos_to_delete' => 'sometimes|nullable|array',
                'photos_to_delete.*' => 'integer',
                'photos' => 'sometimes|nullable|array',
                'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return $this->respondValidationErrors($validator->errors()->toArray());
            }

            try {
                DB::beginTransaction();

                // Atualizar o slug se o título foi alterado
                if ($request->has('title') && $property->title !== $request->title) {
                    $uniqueNumber = explode('-', $property->slug);
                    $uniqueNumber = end($uniqueNumber);
                    $slug = Str::slug($request->title) . '-' . $uniqueNumber;
                    $property->slug = $slug;
                }

                // Atualizar o imóvel
                $property->fill($request->except(['features', 'photos', 'photos_to_delete']));
                $property->save();

                // Atualizar características (features)
                if ($request->has('features')) {
                    $property->features()->sync($request->features);
                }

                // Remover fotos marcadas para exclusão
                if ($request->has('photos_to_delete')) {
                    $media = $property->getMedia('photos');
                    foreach ($request->photos_to_delete as $mediaId) {
                        $mediaItem = $media->firstWhere('id', $mediaId);
                        if ($mediaItem) {
                            $mediaItem->delete();
                        }
                    }
                }

                // Adicionar novas fotos
                if ($request->hasFile('photos')) {
                    foreach ($request->file('photos') as $photo) {
                        $property->addMedia($photo)
                            ->usingFileName(time() . '_' . $photo->getClientOriginalName())
                            ->toMediaCollection('photos');
                    }
                }

                DB::commit();

                // Carregar relações
                $property->load(['propertyType', 'city', 'neighborhood', 'features', 'owner', 'agent', 'propertyImages']);

                // Adicionar URLs de imagens
                try {
                    // Carregar imagens do Spatie Media Library
                    $property->main_photo = $property->getFirstMediaUrl('photos');
                    $property->photos = $property->getMedia('photos')->map(function ($media) {
                        return [
                            'id' => $media->id,
                            'url' => $media->getUrl(),
                            'name' => $media->file_name
                        ];
                    });
                    
                    // Carregar imagens do modelo PropertyImage com URLs
                    if ($property->propertyImages && $property->propertyImages->count() > 0) {
                        $property->property_images = $property->propertyImages->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'property_id' => $image->property_id,
                                'title' => $image->title,
                                'description' => $image->description,
                                'file_path' => $image->file_path,
                                'file_name' => $image->file_name,
                                'order' => $image->order,
                                'is_featured' => $image->is_featured,
                                'url' => $image->getUrl(),
                                'thumbnail_url' => $image->getThumbnailUrl(),
                            ];
                        });
                        
                        // Definir a imagem de capa
                        $featuredImage = $property->propertyImages->where('is_featured', true)->first();
                        if ($featuredImage) {
                            $property->featured_image = [
                                'id' => $featuredImage->id,
                                'url' => $featuredImage->getUrl(),
                                'thumbnail_url' => $featuredImage->getThumbnailUrl(),
                            ];
                        }
                    } else {
                        $property->property_images = [];
                        $property->featured_image = null;
                    }
                } catch (\Exception $e) {
                    // Se houver erro ao obter mídia, definir valores padrão
                    $property->main_photo = null;
                    $property->photos = [];
                    $property->property_images = [];
                    $property->featured_image = null;
                }

                return $this->respond([
                    'success' => true,
                    'message' => 'Imóvel atualizado com sucesso',
                    'property' => $property
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                return $this->respondInternalError('Erro ao atualizar imóvel: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            return $this->respondNotFound('Imóvel não encontrado');
        }
    }

    /**
     * Remove um imóvel específico (soft delete).
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        // Verificar permissões
        if (!Auth::user()->can('delete properties')) {
            return $this->respondForbidden('Você não tem permissão para excluir imóveis');
        }

        try {
            $property = Property::findOrFail($id);
            $property->delete();

            return $this->respondWithMessage('Imóvel excluído com sucesso');
        } catch (\Exception $e) {
            return $this->respondNotFound('Imóvel não encontrado');
        }
    }

    /**
     * Busca imóveis por termo de pesquisa.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'term' => 'required|string|min:3',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        if ($validator->fails()) {
            return $this->respondValidationErrors($validator->errors()->toArray());
        }

        $term = $request->input('term');
        $perPage = $request->input('per_page', 15);

        $properties = Property::with(['propertyType', 'city', 'neighborhood'])
            ->where('active', true)
            ->where(function ($query) use ($term) {
                $query->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('address', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%");
            })
            ->orderBy('featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Adicionar URLs de imagens
        $properties->getCollection()->transform(function ($property) {
            try {
                $property->main_photo = $property->getFirstMediaUrl('photos');
            } catch (\Exception $e) {
                $property->main_photo = null;
            }
            return $property;
        });

        return $this->respondWithPagination($properties, [
            'success' => true,
            'properties' => $properties->items()
        ]);
    }

    /**
     * Marca um imóvel como destaque ou remove o destaque.
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function toggleFeatured($id, Request $request): JsonResponse
    {
        // Verificar permissões
        if (!Auth::user()->can('edit properties')) {
            return $this->respondForbidden('Você não tem permissão para destacar imóveis');
        }

        try {
            $property = Property::findOrFail($id);
            $property->featured = !$property->featured;
            $property->save();

            return $this->respond([
                'success' => true,
                'message' => $property->featured ? 'Imóvel marcado como destaque' : 'Destaque removido do imóvel',
                'featured' => $property->featured
            ]);
        } catch (\Exception $e) {
            return $this->respondNotFound('Imóvel não encontrado');
        }
    }

    /**
     * Altera o status de um imóvel.
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function changeStatus($id, Request $request): JsonResponse
    {
        // Verificar permissões
        if (!Auth::user()->can('edit properties')) {
            return $this->respondForbidden('Você não tem permissão para alterar o status de imóveis');
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['available', 'sold', 'rented', 'reserved', 'unavailable'])]
        ]);

        if ($validator->fails()) {
            return $this->respondValidationErrors($validator->errors()->toArray());
        }

        try {
            $property = Property::findOrFail($id);
            $oldStatus = $property->status;
            $property->status = $request->status;
            $property->save();

            return $this->respond([
                'success' => true,
                'message' => 'Status do imóvel alterado de ' . $oldStatus . ' para ' . $property->status,
                'status' => $property->status
            ]);
        } catch (\Exception $e) {
            return $this->respondNotFound('Imóvel não encontrado');
        }
    }
} 