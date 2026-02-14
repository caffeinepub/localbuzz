import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Megaphone, Upload, CheckCircle, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateShopUpdate } from '../hooks/useShopUpdates';
import { ExternalBlob } from '../backend';
import { getEndOfToday, getTwoDaysFromNow, customDateToTime } from '../utils/time';

type ExpiryOption = 'today' | '2days' | 'custom';

export default function ShopPostUpdatePage() {
  const navigate = useNavigate();
  const createUpdate = useCreateShopUpdate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('today');
  const [customDate, setCustomDate] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    if (!title.trim()) {
      setValidationError('Title is required');
      return false;
    }
    if (title.trim().length > 100) {
      setValidationError('Title must be 100 characters or less');
      return false;
    }
    if (expiryOption === 'custom' && !customDate) {
      setValidationError('Please select a custom expiry date');
      return false;
    }
    if (expiryOption === 'custom' && customDate) {
      const selectedDate = new Date(customDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setValidationError('Custom date cannot be in the past');
        return false;
      }
    }
    return true;
  };

  const getExpiryDate = (): bigint => {
    switch (expiryOption) {
      case 'today':
        return getEndOfToday();
      case '2days':
        return getTwoDaysFromNow();
      case 'custom':
        if (!customDate) throw new Error('Custom date not selected');
        return customDateToTime(new Date(customDate));
      default:
        throw new Error('Invalid expiry option');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    try {
      let imageBlob: ExternalBlob | undefined = undefined;

      if (imageFile) {
        // Convert file to bytes
        const arrayBuffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Create ExternalBlob with upload progress tracking
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const expiryDate = getExpiryDate();

      await createUpdate.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        image: imageBlob,
        expiryDate,
      });

      setSuccessMessage('Update posted successfully!');
      setUploadProgress(0);

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate({ to: '/shop-dashboard' });
      }, 1500);
    } catch (error: any) {
      setValidationError(error.message || 'Failed to post update. Please try again.');
      setUploadProgress(0);
    }
  };

  const isSubmitting = createUpdate.isPending;

  // Get minimum date for custom date picker (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Megaphone className="h-10 w-10 text-primary" />
          Post Update
        </h1>
        <p className="text-lg text-muted-foreground">
          Share news, offers, or announcements with your customers
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

      {/* Post Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Update Details</CardTitle>
          <CardDescription className="text-base">
            Create an update to inform customers about your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Special Discount Today!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                maxLength={100}
                required
                className="h-12 text-base"
              />
              <p className="text-sm text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about your update..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="text-base"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="updateImage" className="text-base">Image (Optional)</Label>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Update preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="updateImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="flex-1 h-12"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload an image to make your update more engaging (max 5MB)
                </p>
              </div>
            </div>

            {/* Expiry Options */}
            <div className="space-y-3">
              <Label className="text-base">Expiry *</Label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setExpiryOption('today')}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    expiryOption === 'today'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium text-base">Today</div>
                  <div className="text-sm text-muted-foreground">Expires at end of day</div>
                </button>

                <button
                  type="button"
                  onClick={() => setExpiryOption('2days')}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    expiryOption === '2days'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium text-base">2 Days</div>
                  <div className="text-sm text-muted-foreground">Expires in 48 hours</div>
                </button>

                <button
                  type="button"
                  onClick={() => setExpiryOption('custom')}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    expiryOption === 'custom'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Custom Date
                  </div>
                  <div className="text-sm text-muted-foreground">Choose your own expiry date</div>
                </button>

                {expiryOption === 'custom' && (
                  <div className="pl-4">
                    <Input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      min={today}
                      disabled={isSubmitting}
                      className="h-12 text-base"
                    />
                  </div>
                )}
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
                  Posting...
                </>
              ) : (
                <>
                  <Megaphone className="mr-2 h-5 w-5" />
                  Post Update
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
