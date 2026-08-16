Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\786\Downloads\Loom Movies\public\logo.png"
$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$srcW = $srcBmp.Width
$srcH = $srcBmp.Height

# Function to create a centered resized icon on a square transparent canvas
function Create-SquareIcon($targetSize, $destPath) {
    $canvas = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    
    # Enable high quality rendering
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Calculate scale factor to leave a ~5% margin
    $margin = [math]::Max(10, [math]::Round($targetSize * 0.05))
    $maxDimension = $targetSize - ($margin * 2)
    
    $scale = 1.0
    if ($srcW -gt $srcH) {
        $scale = $maxDimension / $srcW
    } else {
        $scale = $maxDimension / $srcH
    }
    
    $newW = [math]::Round($srcW * $scale)
    $newH = [math]::Round($srcH * $scale)
    
    # Center coordinates
    $posX = [math]::Round(($targetSize - $newW) / 2)
    $posY = [math]::Round(($targetSize - $newH) / 2)
    
    $destRect = New-Object System.Drawing.Rectangle($posX, $posY, $newW, $newH)
    $g.DrawImage($srcBmp, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)
    
    $g.Dispose()
    $canvas.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
}

# Generate 512x512 and 192x192 icons in both public and dist directories
Create-SquareIcon 512 "c:\Users\786\Downloads\Loom Movies\public\logo512.png"
Create-SquareIcon 192 "c:\Users\786\Downloads\Loom Movies\public\logo192.png"
Create-SquareIcon 512 "c:\Users\786\Downloads\Loom Movies\dist\logo512.png"
Create-SquareIcon 192 "c:\Users\786\Downloads\Loom Movies\dist\logo192.png"

$srcBmp.Dispose()
Write-Host "SUCCESS: 512x512 and 192x192 square PWA icons generated successfully!"
