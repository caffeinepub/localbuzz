import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetShopsByOwner, useRegisterShop, useUpdateShop } from '../hooks/useShop';
import { ExternalBlob } from '../backend';
import { SHOP_CATEGORIES } from '../constants/shopCategories';

export default function ShopRegistrationPage() {
  const navigate = useNavigate();
  const { data: shops, isLoading: shopsLoading } = useGetShopsByOwner();
  const existingShop = shops && shops.length > 0 ? shops[0] : null;
  const registerShop = useRegisterShop();
  const updateShop = useUpdateShop();

  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditMode = !!existingShop;

  // Populate form with existing shop data
  useEffect(() => {
    if (existingShop) {
      setShopName(existingShop.shopName);
      setCategory(existingShop.category);
      setAddress(existingShop.address);
      setLatitude(existingShop.location.latitude.toString());
      setLongitude(existingShop.location.longitude.toString());
      setImagePreview(existingShop.shopImage.getDirectURL());
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
      setValidationError('Category is required');
      return false;
    }
    if (!address.trim()) {
      setValidationError('Address is required');
      return false;
    }
    if (!latitude || !longitude) {
      setValidationError('Location coordinates are required');
      return false;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setValidationError('Invalid coordinates. Please enter valid numbers.');
      return false;
    }

    if (lat < -90 || lat > 90) {
      setValidationError('Latitude must be between -90 and 90');
      return false;
    }

    if (lon < -180 || lon > 180) {
      setValidationError('Longitude must be between -180 and 180');
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
      let shopImage: ExternalBlob;

      if (imageFile) {
        // Convert file to bytes
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Create ExternalBlob with upload progress tracking
        shopImage = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (existingShop) {
        // Use existing image in edit mode
        shopImage = existingShop.shopImage;
      } else {
        throw new Error('Shop image is required');
      }

      const location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      if (isEditMode && existingShop) {
        await updateShop.mutateAsync({
          shopId: existingShop.shopId,
          shopName: shopName.trim(),
          category,
          address: address.trim(),
          location,
          shopImage,
        });
        setSuccessMessage('Shop updated successfully!');
      } else {
        await registerShop.mutateAsync({
          shopName: shopName.trim(),
          category,
          address: address.trim(),
          location,
          shopImage,
        });
        setSuccessMessage('Shop registered successfully!');
      }

      setUploadProgress(0);

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate({ to: '/shop-dashboard' });
      }, 1500);
    } catch (error: any) {
      setValidationError(error.message || 'Failed to save shop. Please try again.');
      setUploadProgress(0);
    }
  };

  const isSubmitting = registerShop.isPending || updateShop.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Store className="h-10 w-10 text-primary" />
          {isEditMode ? 'Edit Shop' : 'Register Shop'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isEditMode ? 'Update your shop information' : 'Set up your shop profile to start reaching customers'}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-primary/10 border-primary/20">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary text-base">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-base">{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Shop Information</CardTitle>
          <CardDescription className="text-base">
            Provide details about your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="shopName" className="text-base">Shop Name *</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="e.g., Fresh Mart Grocery"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                disabled={isSubmitting}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SHOP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-base">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter your shop's full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                required
                className="text-base"
              />
            </div>

            {/* Location Coordinates */}
            <div className="space-y-2">
              <Label className="text-base">Location Coordinates *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm text-muted-foreground">Latitude</Label>
                  <Input
                    id="latitude"
                    type="text"
                    placeholder="e.g., 28.6139"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm text-muted-foreground">Longitude</Label>
                  <Input
                    id="longitude"
                    type="text"
                    placeholder="e.g., 77.2090"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your shop's GPS coordinates (you can find these on Google Maps)
              </p>
            </div>

            {/* Shop Image */}
            <div className="space-y-2">
              <Label htmlFor="shopImage" className="text-base">
                Shop Image {!isEditMode && '*'}
              </Label>
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
                    className="flex-1 h-12"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a photo of your shop (max 5MB)
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
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
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Registering...'}
                </>
              ) : (
                <>
                  <Store className="mr-2 h-5 w-5" />
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
