# News Component "View Products" Button Usage

## Overview

The News component now supports an optional "View Products" button that can be displayed alongside the existing "Explore More News" button.

## Usage

### Basic Usage (default behavior)

By default, only the "Explore More News" button is shown:

```javascript
// pages/news/[slug].js
export default function Newscreen({ news }) {
  // Only shows "Explore More News" button
}
```

### With Products Button

To show both buttons, pass the `showProductsButton` prop as `true`:

```javascript
// pages/news/[slug].js
export default function Newscreen({ news, showProductsButton = true }) {
  // Shows both "Explore More News" and "View Products" buttons
}
```

### From getServerSideProps

You can conditionally show the products button based on news content or other criteria:

```javascript
export async function getServerSideProps(context) {
  const { slug } = context.params;
  await db.connect(true);

  const doc = await News.findOne({ slug }).lean();
  if (!doc) return { notFound: true };

  // Example: Show products button for specific categories or tags
  const showProductsButton =
    doc.category === "product-related" || doc.tags?.includes("products");

  return {
    props: {
      news: {
        // ... news data
      },
      showProductsButton, // Pass the prop
    },
  };
}
```

## Styling

The buttons use a responsive design:

- **Mobile**: Buttons stack vertically
- **Desktop**: Buttons display side by side

### Button Styles

- **Explore More News**: Primary button (blue background, white text)
- **View Products**: Secondary button (white background, blue border and text, transforms to primary on hover)

## Implementation Details

- The "View Products" button links to `/products`
- Both buttons maintain consistent styling with the rest of the site
- The layout is responsive and accessible
- Smooth transitions on hover states
