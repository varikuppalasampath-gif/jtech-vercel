Add-Type -AssemblyName System.Drawing

$src = "C:/Users/jai/.gemini/antigravity/brain/70152a0d-ac2f-4075-8369-845f9585a1b8/.user_uploaded/media_1794464261355_db136828.jpg"
$destDir = "c:/Users/jai/Desktop/Project/jtech-website/public"

$origBmp = [System.Drawing.Bitmap]::FromFile($src)
$origBmp.Save("$destDir/favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created $destDir/favicon.png"

$sizes = @(
    @{ name = "favicon-16x16.png"; size = 16 },
    @{ name = "favicon-32x32.png"; size = 32 },
    @{ name = "favicon-48x48.png"; size = 48 },
    @{ name = "apple-touch-icon.png"; size = 180 },
    @{ name = "android-chrome-192x192.png"; size = 192 },
    @{ name = "android-chrome-512x512.png"; size = 512 }
)

foreach ($item in $sizes) {
    $s = $item.size
    $targetBmp = New-Object System.Drawing.Bitmap $s, $s
    $graphics = [System.Drawing.Graphics]::FromImage($targetBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($origBmp, 0, 0, $s, $s)
    $targetBmp.Save("$destDir/$($item.name)", [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $targetBmp.Dispose()
    Write-Host "Generated $($item.name)"
}

# Also update favicon.ico
$icoBmp = New-Object System.Drawing.Bitmap 32, 32
$icoG = [System.Drawing.Graphics]::FromImage($icoBmp)
$icoG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$icoG.DrawImage($origBmp, 0, 0, 32, 32)
$hIcon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream("$destDir/favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$icoG.Dispose()
$icoBmp.Dispose()
Write-Host "Generated favicon.ico (32x32)"

$origBmp.Dispose()

