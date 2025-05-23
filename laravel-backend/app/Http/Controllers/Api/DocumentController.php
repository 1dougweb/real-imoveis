<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Construtor que aplica middleware de autenticação.
     */
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('permission:view documents')->only(['index', 'show']);
        $this->middleware('permission:create documents')->only(['store', 'upload']);
        $this->middleware('permission:edit documents')->only(['update', 'approve', 'reject']);
        $this->middleware('permission:delete documents')->only(['destroy']);
    }

    /**
     * Listar todos os documentos.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['documentType']);

        // Filtros
        if ($request->has('document_type_id')) {
            $query->where('document_type_id', $request->document_type_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('documentable_type')) {
            $query->where('documentable_type', $request->documentable_type);
        }

        if ($request->has('documentable_id')) {
            $query->where('documentable_id', $request->documentable_id);
        }

        // Verificar se deve mostrar apenas documentos visíveis para o cliente
        if ($request->has('visible_to_client') && $request->visible_to_client) {
            $query->where('is_visible_to_client', true);
        }

        // Ordenação
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        // Sanitizar campos de ordenação
        if (!in_array($sortField, ['created_at', 'title', 'status', 'expires_at'])) {
            $sortField = 'created_at';
        }

        $query->orderBy($sortField, $sortOrder);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $documents = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Exibir um documento específico.
     *
     * @param Document $document
     * @return JsonResponse
     */
    public function show(Document $document): JsonResponse
    {
        // Carregar os relacionamentos
        $document->load(['documentType']);

        return response()->json([
            'success' => true,
            'data' => $document
        ]);
    }

    /**
     * Criar um novo documento.
     *
     * @param DocumentRequest $request
     * @return JsonResponse
     */
    public function store(DocumentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Verificar se o tipo de documento existe
        $documentType = DocumentType::findOrFail($validated['document_type_id']);

        // Criar o documento
        $document = Document::create([
            'document_type_id' => $validated['document_type_id'],
            'documentable_id' => $validated['documentable_id'],
            'documentable_type' => $validated['documentable_type'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? Document::STATUS_PENDING,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_visible_to_client' => $validated['is_visible_to_client'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Documento criado com sucesso',
            'data' => $document
        ], 201);
    }

    /**
     * Upload de arquivo para documento.
     *
     * @param DocumentRequest $request
     * @return JsonResponse
     */
    public function upload(DocumentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $file = $request->file('file');

        // Gerar nome único para o arquivo
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Definir caminho de armazenamento baseado no tipo de entidade e ID
        $path = 'documents/' . $validated['documentable_type'] . '/' . $validated['documentable_id'];
        
        // Armazenar o arquivo
        $filePath = $file->storeAs($path, $filename, 'private');

        // Criar o documento
        $document = Document::create([
            'document_type_id' => $validated['document_type_id'],
            'documentable_id' => $validated['documentable_id'],
            'documentable_type' => $validated['documentable_type'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
            'status' => Document::STATUS_PENDING,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_visible_to_client' => $validated['is_visible_to_client'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Documento enviado com sucesso',
            'data' => $document
        ], 201);
    }

    /**
     * Atualizar um documento existente.
     *
     * @param DocumentRequest $request
     * @param Document $document
     * @return JsonResponse
     */
    public function update(DocumentRequest $request, Document $document): JsonResponse
    {
        $validated = $request->validated();

        // Atualizar o documento
        $document->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Documento atualizado com sucesso',
            'data' => $document
        ]);
    }

    /**
     * Aprovar um documento.
     *
     * @param Document $document
     * @return JsonResponse
     */
    public function approve(Document $document): JsonResponse
    {
        $document->status = Document::STATUS_APPROVED;
        $document->save();

        return response()->json([
            'success' => true,
            'message' => 'Documento aprovado com sucesso',
            'data' => $document
        ]);
    }

    /**
     * Rejeitar um documento.
     *
     * @param Request $request
     * @param Document $document
     * @return JsonResponse
     */
    public function reject(Request $request, Document $document): JsonResponse
    {
        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000'
        ]);

        $document->status = Document::STATUS_REJECTED;
        $document->save();

        return response()->json([
            'success' => true,
            'message' => 'Documento rejeitado com sucesso',
            'data' => $document
        ]);
    }

    /**
     * Remover um documento.
     *
     * @param Document $document
     * @return JsonResponse
     */
    public function destroy(Document $document): JsonResponse
    {
        // Se houver um arquivo associado, excluí-lo do armazenamento
        if ($document->file_path) {
            Storage::disk('private')->delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Documento excluído com sucesso'
        ]);
    }
} 