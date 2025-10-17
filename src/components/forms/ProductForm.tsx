import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema, type ProductInput } from '../../../shared/validation';
import { Product } from '@/lib/types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product || {
      name: '',
      price: 0,
      cost: 0,
      stock: 0,
      category: '',
      barcode: '',
      sku: '',
      minStock: 10,
      unit: 'pcs',
      taxRate: 18,
    },
  });

  const handleFormSubmit = async (data: ProductInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Product Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.name ? 'border-danger' : 'border-neutral-300'
          }`}
          placeholder="Enter product name"
        />
        {errors.name && (
          <p className="text-danger text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          type="text"
          {...register('category')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., Electronics, Food"
        />
        {errors.category && (
          <p className="text-danger text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Price and Cost */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Price <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.price ? 'border-danger' : 'border-neutral-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && (
            <p className="text-danger text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Cost <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('cost', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.cost ? 'border-danger' : 'border-neutral-300'
            }`}
            placeholder="0.00"
          />
          {errors.cost && (
            <p className="text-danger text-sm mt-1">{errors.cost.message}</p>
          )}
        </div>
      </div>

      {/* Stock and Min Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Stock <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.stock ? 'border-danger' : 'border-neutral-300'
            }`}
            placeholder="0"
          />
          {errors.stock && (
            <p className="text-danger text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Min Stock</label>
          <input
            type="number"
            {...register('minStock', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="10"
          />
          {errors.minStock && (
            <p className="text-danger text-sm mt-1">{errors.minStock.message}</p>
          )}
        </div>
      </div>

      {/* Barcode and SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Barcode</label>
          <input
            type="text"
            {...register('barcode')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            type="text"
            {...register('sku')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="PROD-001"
          />
        </div>
      </div>

      {/* Unit and Tax Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            type="text"
            {...register('unit')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="pcs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
          <input
            type="number"
            step="0.01"
            {...register('taxRate', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="18"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
          placeholder="Product description..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
