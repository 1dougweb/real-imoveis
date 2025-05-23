<?php

require __DIR__ . '/vendor/autoload.php';

use App\Models\PropertyImage;
use Illuminate\Support\Facades\URL;

// Set the base URL for testing
URL::forceRootUrl('http://localhost:8000');

// Create a test property image
$image = new PropertyImage();
$image->file_path = 'properties/1/test-image.jpg';

// Test the URL generation
echo "Testing URL generation for property images:\n\n";
echo "File path: " . $image->file_path . "\n";
echo "Generated URL: " . $image->getUrl() . "\n";
echo "Generated thumbnail URL: " . $image->getThumbnailUrl() . "\n"; 