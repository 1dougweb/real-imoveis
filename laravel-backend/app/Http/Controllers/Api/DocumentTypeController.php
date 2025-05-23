<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\DocumentTypeRequest;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DocumentTypeController extends ApiController
{
    /**
     * Display a listing of the document types.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('view document types');
        
        $documentTypes = DocumentType::all();
        
        return $this->sendResponse($documentTypes, 'Tipos de documento retornados com sucesso');
    }

    /**
     * Store a newly created document type in storage.
     *
     * @param  \App\Http\Requests\DocumentTypeRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(DocumentTypeRequest $request)
    {
        $this->authorize('create document types');
        
        $documentType = DocumentType::create($request->validated());

        return $this->sendResponse($documentType, 'Tipo de documento criado com sucesso', 201);
    }

    /**
     * Display the specified document type.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('view document types');
        
        $documentType = DocumentType::find($id);
        
        if (is_null($documentType)) {
            return $this->sendError('Tipo de documento não encontrado');
        }
        
        return $this->sendResponse($documentType, 'Tipo de documento encontrado com sucesso');
    }

    /**
     * Update the specified document type in storage.
     *
     * @param  \App\Http\Requests\DocumentTypeRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(DocumentTypeRequest $request, $id)
    {
        $this->authorize('edit document types');
        
        $documentType = DocumentType::find($id);
        
        if (is_null($documentType)) {
            return $this->sendError('Tipo de documento não encontrado');
        }
        
        $documentType->update($request->validated());
        
        return $this->sendResponse($documentType, 'Tipo de documento atualizado com sucesso');
    }

    /**
     * Remove the specified document type from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('delete document types');
        
        $documentType = DocumentType::find($id);
        
        if (is_null($documentType)) {
            return $this->sendError('Tipo de documento não encontrado');
        }
        
        // Verificar se o tipo de documento está sendo usado antes de excluir
        if ($documentType->documents()->count() > 0) {
            return $this->sendError('Este tipo de documento não pode ser excluído pois está associado a documentos', [], 422);
        }
        
        $documentType->delete();
        
        return $this->sendResponse([], 'Tipo de documento excluído com sucesso');
    }
} 