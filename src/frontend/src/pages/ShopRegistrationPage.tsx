import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Upload, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { useGetCallerShop, useRegisterShop, useUpdateShop } from '../hooks/useShop';
import { ExternalBlob } from '../backend';

const SHOP_CATEGORIES = ['Grocery', 'Clothing', 'Electronics', 'Medical', 'Food', 'Other'] as const;

export default function ShopRegistrationPage() {
  const { coordinates, status: locationStatus, requestPermission, isLoading: locationLoading } = useLocationPermission();
  const { data: existingShop, isLoading: shopLoading, isFetched: shopFetched } = useGetCallerShop();
  const registerShop = useRegisterShop();
  const updateShop = useUpdateShop();

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditMode = !!existingShop;

  // Load existing shop data
  useEffect(() => {
    if (existingShop) {
      setShopName(existingShop.name);
      setCategory(existingShop.category);
      setShopAddress(existingShop.address);
      // Load existing image preview
      if (existingShop.image) {
        setImagePreview(existingShop.image.getDirectURL());
      }
    }
  }, [existingShop]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setValidationError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    if (!shopName.trim()) {
      setValidationError('Shop name is required');
      return false;
    }
    if (!category) {
      setValidationError('Please select a category');
      return false;
    }
    if (!shopAddress.trim()) {
      setValidationError('Shop address is required');
      return false;
    }
    if (!coordinates) {
      setValidationError('Location is required. Please enable location access.');
      return false;
    }
    if (!isEditMode && !imageFile) {
      setValidationError('Shop image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    try {
      let imageBlob: ExternalBlob;

      if (imageFile) {
        // Convert file to bytes
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Create ExternalBlob with upload progress tracking
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (existingShop?.image) {
        // Use existing image if no new image is uploaded
        imageBlob = existingShop.image;
      } else {
        setValidationError('Shop image is required');
        return;
      }

      const shopData = {
        name: shopName.trim(),
        category,
        address: shopAddress.trim(),
        latitude: coordinates!.latitude,
        longitude: coordinates!.longitude,
        image: imageBlob,
      };

      if (isEditMode) {
        await updateShop.mutateAsync(shopData);
        setSuccessMessage('Shop updated successfully!');
      } else {
        await registerShop.mutateAsync(shopData);
        setSuccessMessage('Shop registered successfully!');
      }

      setUploadProgress(0);
    } catch (error: any) {
      setValidationError(error.message || 'Failed to save shop. Please try again.');
      setUploadProgress(0);
    }
  };

  const isSubmitting = registerShop.isPending || updateShop.isPending;
  const showLocationPrompt = locationStatus !== 'granted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          {isEditMode ? 'Update Shop' : 'Register Your Shop'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Update your shop information' : 'Set up your shop to start reaching local customers'}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-primary/10 border-primary/20">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Location Prompt */}
      {showLocationPrompt && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <MapPin className="h-5 w-5" />
              Location Required
            </CardTitle>
            <CardDescription>
              Please enable location access to register your shop. This helps customers find you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={requestPermission}
              disabled={locationLoading}
              className="w-full"
              size="lg"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Enable Location
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>
            Fill in your shop details. All fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="Enter your shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SHOP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shop Address */}
            <div className="space-y-2">
              <Label htmlFor="shopAddress">Shop Address</Label>
              <Textarea
                id="shopAddress"
                placeholder="Enter your complete shop address"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                required
              />
            </div>

            {/* GPS Location Display */}
            {coordinates && (
              <div className="space-y-2">
                <Label>GPS Location</Label>
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Latitude</span>
                    <span className="text-sm font-mono">{coordinates.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Longitude</span>
                    <span className="text-sm font-mono">{coordinates.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Image */}
            <div className="space-y-2">
              <Label htmlFor="shopImage">Shop Image</Label>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Shop preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="shopImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a clear image of your shop (max 5MB, JPG/PNG)
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading image...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !coordinates || shopLoading}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%...` : 'Saving...'}
                </>
              ) : (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Shop' : 'Register Shop'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
