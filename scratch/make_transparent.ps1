Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\786\.gemini\antigravity-ide\brain\7a907c63-579a-49fa-980b-93b320e37406\.user_uploaded\media_1786881377465.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

# Copy to a new bitmap to write to it
$newBmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($bmp, 0, 0, $width, $height)
$g.Dispose()
$bmp.Dispose()

# Pre-calculate coordinates to avoid powershell type issues
$w_minus_1 = $width - 1
$h_minus_1 = $height - 1

# Flood fill transparency from corners
$visited = New-Object "Boolean[,]" $width, $height
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Add 4 corners as seed points
$queue.Enqueue((New-Object System.Drawing.Point(0, 0)))
$queue.Enqueue((New-Object System.Drawing.Point($w_minus_1, 0)))
$queue.Enqueue((New-Object System.Drawing.Point(0, $h_minus_1)))
$queue.Enqueue((New-Object System.Drawing.Point($w_minus_1, $h_minus_1)))

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $x = $pt.X
    $y = $pt.Y

    if ($x -lt 0 -or $x -ge $width -or $y -lt 0 -or $y -ge $height) { continue }
    if ($visited[$x, $y]) { continue }
    $visited[$x, $y] = $true

    $pixel = $newBmp.GetPixel($x, $y)
    
    # Check if pixel is "white-ish" (R, G, B all > 220)
    if ($pixel.R -gt 220 -and $pixel.G -gt 220 -and $pixel.B -gt 220) {
        $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0)) # transparent

        # Calculate neighbor coordinates
        $x_plus_1 = $x + 1
        $x_minus_1 = $x - 1
        $y_plus_1 = $y + 1
        $y_minus_1 = $y - 1

        # Enqueue neighbors
        $queue.Enqueue((New-Object System.Drawing.Point($x_plus_1, $y)))
        $queue.Enqueue((New-Object System.Drawing.Point($x_minus_1, $y)))
        $queue.Enqueue((New-Object System.Drawing.Point($x, $y_plus_1)))
        $queue.Enqueue((New-Object System.Drawing.Point($x, $y_minus_1)))
    }
}

# Crop the image to the squircle bounding box with a 5px margin
# Bounding box found: left=68, right=443, top=58, bottom=451
$left = 68 - 5
$top = 58 - 5
$w = (443 - 68) + 10
$h = (451 - 58) + 10

# Create final cropped bitmap
$croppedBmp = New-Object System.Drawing.Bitmap($w, $h)
$gCropped = [System.Drawing.Graphics]::FromImage($croppedBmp)
$gCropped.Clear([System.Drawing.Color]::Transparent)
$gCropped.DrawImage($newBmp, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $left, $top, $w, $h, [System.Drawing.GraphicsUnit]::Pixel)
$gCropped.Dispose()

# Save final cropped & transparent logo files
$dest1 = "c:\Users\786\Downloads\Loom Movies\public\logo.png"
$dest2 = "c:\Users\786\Downloads\Loom Movies\public\favicon.png"
$dest3 = "c:\Users\786\Downloads\Loom Movies\dist\logo.png"
$dest4 = "c:\Users\786\Downloads\Loom Movies\dist\favicon.png"

$croppedBmp.Save($dest1, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Save($dest2, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Save($dest3, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Save($dest4, [System.Drawing.Imaging.ImageFormat]::Png)

$newBmp.Dispose()
$croppedBmp.Dispose()

Write-Host "SUCCESS: Logo processed, cropped, and saved to destinations!"
