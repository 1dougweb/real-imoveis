<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiController extends Controller
{
    /**
     * Status code padrão para respostas de sucesso
     *
     * @var int
     */
    protected $statusCode = 200;

    /**
     * Obtém o código de status atual
     *
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * Define o código de status para a resposta
     *
     * @param int $statusCode
     * @return $this
     */
    public function setStatusCode(int $statusCode): self
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    /**
     * Resposta de sucesso
     *
     * @param array|string $data
     * @param array $headers
     * @return JsonResponse
     */
    public function respond($data, array $headers = []): JsonResponse
    {
        return response()->json($data, $this->getStatusCode(), $headers);
    }

    /**
     * Resposta de sucesso com uma mensagem
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondWithMessage(string $message): JsonResponse
    {
        return $this->respond([
            'success' => true,
            'message' => $message
        ]);
    }

    /**
     * Resposta para erros
     *
     * @param string $message
     * @param string|null $errorCode
     * @return JsonResponse
     */
    public function respondWithError(string $message, ?string $errorCode = null): JsonResponse
    {
        $data = [
            'success' => false,
            'message' => $message
        ];

        if ($errorCode) {
            $data['error_code'] = $errorCode;
        }

        return $this->respond($data);
    }

    /**
     * Resposta para erro 404 - Not Found
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondNotFound(string $message = 'Not Found'): JsonResponse
    {
        return $this->setStatusCode(404)->respondWithError($message);
    }

    /**
     * Resposta para erro 400 - Bad Request
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondBadRequest(string $message = 'Bad Request'): JsonResponse
    {
        return $this->setStatusCode(400)->respondWithError($message);
    }

    /**
     * Resposta para erro 401 - Unauthorized
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondUnauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->setStatusCode(401)->respondWithError($message);
    }

    /**
     * Resposta para erro 403 - Forbidden
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondForbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->setStatusCode(403)->respondWithError($message);
    }

    /**
     * Resposta para erro 422 - Unprocessable Entity (validação)
     *
     * @param array $errors
     * @param string $message
     * @return JsonResponse
     */
    public function respondValidationErrors(array $errors, string $message = 'Validation errors'): JsonResponse
    {
        return $this->setStatusCode(422)->respond([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ]);
    }

    /**
     * Resposta para erro 500 - Internal Server Error
     *
     * @param string $message
     * @return JsonResponse
     */
    public function respondInternalError(string $message = 'Internal Server Error'): JsonResponse
    {
        return $this->setStatusCode(500)->respondWithError($message);
    }

    /**
     * Resposta para criação de recurso 201 - Created
     *
     * @param array|string $data
     * @return JsonResponse
     */
    public function respondCreated($data): JsonResponse
    {
        return $this->setStatusCode(201)->respond($data);
    }

    /**
     * Resposta para conteúdo paginado
     *
     * @param LengthAwarePaginator $paginator
     * @param array $data
     * @return JsonResponse
     */
    public function respondWithPagination(LengthAwarePaginator $paginator, array $data): JsonResponse
    {
        $data = array_merge($data, [
            'pagination' => [
                'total_count' => $paginator->total(),
                'total_pages' => ceil($paginator->total() / $paginator->perPage()),
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'links' => [
                    'next' => $paginator->nextPageUrl(),
                    'prev' => $paginator->previousPageUrl(),
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                ]
            ]
        ]);

        return $this->respond($data);
    }
} 