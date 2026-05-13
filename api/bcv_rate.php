<?php
// api/bcv_rate.php o api/dolar_oficial.php

header('Content-Type: application/json; charset=utf-8');

try {
    $url = 'https://ve.dolarapi.com/v1/dolares/oficial';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json'
        ],
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        throw new Exception('Error consultando DolarApi: ' . curl_error($ch));
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode < 200 || $httpCode >= 300) {
        throw new Exception('DolarApi respondió con código HTTP ' . $httpCode);
    }

    $data = json_decode($response, true);

    if (!is_array($data)) {
        throw new Exception('Respuesta inválida de DolarApi');
    }

    $rate = isset($data['promedio']) ? (float)$data['promedio'] : 0;

    if ($rate <= 0) {
        throw new Exception('No se pudo obtener la tasa oficial');
    }

    echo json_encode([
        'success' => true,
        'source' => $data['fuente'] ?? 'DolarApi',
        'name' => $data['nombre'] ?? 'Dólar Oficial',
        'rate' => $rate,
        'buy' => isset($data['compra']) ? (float)$data['compra'] : null,
        'sell' => isset($data['venta']) ? (float)$data['venta'] : null,
        'updated_at' => $data['fechaActualizacion'] ?? date('c')
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}