import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { AiFillHeart } from "react-icons/ai";
import Layout from "../components/main/Layout";
import LCPProductImage from "../components/products/LCPProductImage";
import { useModalContext } from "../components/context/ModalContext";
import { BsChevronRight } from "react-icons/bs";

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { customer, setCustomer, showStatusMessage } = useModalContext();
  const [productDetails, setProductDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";

  const normalizeProductId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.toString) return value.toString();
    return String(value);
  };

  const normalizeSubdocId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.toString) return value.toString();
    return String(value);
  };

  const getWishlistCacheKey = (item) => {
    const id = normalizeProductId(item?.productId);
    if (id) return `id:${id}`;

    const name = String(item?.name || "")
      .trim()
      .toLowerCase();
    const manufacturer = String(item?.manufacturer || "")
      .trim()
      .toLowerCase();
    if (!name) return "";
    return `name:${manufacturer}|${name}`;
  };

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Login");
    }
  }, [status, router]);

  // Fetch product images for wishlist items
  useEffect(() => {
    if (!customer?.wishlist?.length) return;
    const missing = customer.wishlist.filter((w) => {
      const cacheKey = getWishlistCacheKey(w);
      return cacheKey && !hasOwn(productDetails, cacheKey);
    });
    if (!missing.length) return;

    setLoadingDetails(true);
    Promise.all(
      missing.map(async (w) => {
        const cacheKey = getWishlistCacheKey(w);
        if (!cacheKey) return { cacheKey: "", data: null };

        const id = normalizeProductId(w.productId);
        let data = null;

        if (id) {
          try {
            const byId = await axios.get(`/api/products/${id}`);
            data = byId.data;
          } catch (error) {
            data = null;
          }
        }

        if (!data && w.name) {
          try {
            const byName = await axios.get(
              `/api/products/${encodeURIComponent(w.name)}`,
            );
            data = byName.data;
          } catch (error) {
            data = null;
          }
        }

        return { cacheKey, data };
      }),
    )
      .then((results) => {
        const map = {};
        results.forEach(({ cacheKey, data }) => {
          if (cacheKey) map[cacheKey] = data;
        });
        setProductDetails((prev) => ({ ...prev, ...map }));
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [customer?.wishlist, productDetails]);

  const removeFromWishlist = async (productId) => {
    if (!customer?._id) return;
    try {
      const normalizedProductId = normalizeProductId(productId);
      const { data } = await axios.delete(
        `/api/customer/${customer._id}/wishlist`,
        { data: { productId: normalizedProductId } },
      );
      setCustomer((prev) => ({ ...prev, wishlist: data.wishlist }));
      showStatusMessage("success", "Removed from wishlist");
    } catch {
      showStatusMessage("error", "Could not remove item");
    }
  };

  const removeManualWishlistItem = async (item) => {
    if (!customer?._id) return;
    try {
      const { data } = await axios.delete(
        `/api/customer/${customer._id}/wishlist`,
        {
          data: {
            itemId: normalizeSubdocId(item?._id || item?.wishListProductId),
            name: item?.name || "",
            manufacturer: item?.manufacturer || "",
            addedAt: item?.addedAt || null,
          },
        },
      );
      setCustomer((prev) => ({ ...prev, wishlist: data.wishlist }));
      showStatusMessage("success", "Removed from wishlist");
    } catch {
      showStatusMessage("error", "Could not remove item");
    }
  };

  if (status === "loading") {
    return (
      <Layout title='Wishlist | Stat Surgical Supply'>
        <div className='flex justify-center items-center min-h-[40vh]'>
          <p className='text-gray-500'>Loading...</p>
        </div>
      </Layout>
    );
  }

  const wishlist = customer?.wishlist ?? [];
  const visibleWishlist = wishlist.filter((item) => {
    const cacheKey = getWishlistCacheKey(item);
    if (!cacheKey) return false;
    return Boolean(productDetails[cacheKey]);
  });
  const breadcrumbs = [{ name: "Home", href: "/" }, { name: "My Wishlist" }];

  return (
    <Layout title='Wishlist | Stat Surgical Supply'>
      <nav className='text-sm text-gray-700 mt-0 md:mt-2'>
        <div className='flex justify-between items-center my-0 md:my-4'>
          <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className='flex items-center'>
                {breadcrumb.href ?
                  <Link
                    href={breadcrumb.href}
                    className='hover:underline text-[#0e355e]'
                  >
                    {breadcrumb.name}
                  </Link>
                : <span>{breadcrumb.name}</span>}
                {index < breadcrumbs.length - 1 && (
                  <BsChevronRight className='mx-2 text-gray-500' />
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <h1 className='section__title flex items-center gap-2'>
          <AiFillHeart className='text-red-500' />
          My Wishlist
        </h1>

        {!customer?._id && (
          <p className='text-gray-500 text-center mt-10'>
            Your account does not have a customer profile associated. Please
            contact us for assistance.
          </p>
        )}

        {customer?._id && wishlist.length === 0 && (
          <div className='text-center mt-16'>
            <p className='text-gray-500 mb-4'>Your wishlist is empty.</p>
            <Link href='/products'>
              <button className='primary-button'>Browse Products</button>
            </Link>
          </div>
        )}

        {customer?._id &&
          wishlist.length > 0 &&
          !loadingDetails &&
          visibleWishlist.length === 0 && (
            <div className='text-center mt-16'>
              <p className='text-gray-500 mb-4'>
                No created products from this wishlist are available to display.
              </p>
              <Link href='/products'>
                <button className='primary-button'>Browse Products</button>
              </Link>
            </div>
          )}

        {visibleWishlist.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
            {visibleWishlist.map((item, index) => {
              const productId = normalizeProductId(item.productId);
              const subdocId = normalizeSubdocId(
                item?._id || item?.wishListProductId,
              );
              const cacheKey = getWishlistCacheKey(item);
              const rowKey =
                subdocId ||
                cacheKey ||
                `manual:${String(item?.name || "").toLowerCase()}|${String(
                  item?.manufacturer || "",
                ).toLowerCase()}|${item?.addedAt || index}`;
              const detail = productDetails[cacheKey];
              const productName = item.name || detail?.name;
              const manufacturer = item.manufacturer || detail?.manufacturer;
              const image = detail?.image || item.image;
              const productHref =
                productName ?
                  `/products/${encodeURIComponent(productName)}`
                : "/products";
              const inStock =
                (detail?.each?.countInStock ?? 0) > 0 ||
                (detail?.box?.countInStock ?? 0) > 0;

              return (
                <div
                  key={rowKey}
                  className='relative block justify-center card items-center text-center my-1 text-xs lg:text-sm pb-3 border border-gray-200 shadow-lg rounded-lg p-3 hover:shadow-xl transition-shadow duration-300'
                >
                  <button
                    onClick={() =>
                      productId ?
                        removeFromWishlist(productId)
                      : removeManualWishlistItem(item)
                    }
                    aria-label='Remove from wishlist'
                    className='absolute top-2 right-2 text-red-500 hover:scale-110 transition-transform duration-150'
                  >
                    <AiFillHeart size={22} />
                  </button>

                  <Link href={productHref}>
                    {image && (
                      <div className='relative w-full aspect-[4/5] max-w-[180px] mx-auto mb-2'>
                        <LCPProductImage
                          src={image}
                          alt={`${manufacturer} - ${productName}`}
                          containerClassName='relative w-full aspect-[4/5] max-w-[180px] mx-auto rounded-lg'
                          className='w-full'
                          width={400}
                          height={500}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </div>
                    )}
                    {!image && !loadingDetails && (
                      <div className='w-full aspect-[4/5] max-w-[180px] mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center'>
                        <span className='text-gray-400 text-xs'>No image</span>
                      </div>
                    )}
                  </Link>

                  <h2 className='font-bold mt-2 line-clamp-2'>
                    {productName}
                    {manufacturer ? ` - ${manufacturer}` : ""}
                  </h2>

                  {active && detail && (
                    <p
                      className={`text-xs mt-1 font-semibold ${inStock ? "text-green-600" : "text-red-500"}`}
                    >
                      {inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  )}

                  {item.addedAt && (
                    <p className='text-xs text-gray-400 mt-1'>
                      Added{" "}
                      {new Date(item.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  <Link href={productHref}>
                    <button className='primary-button mt-3 text-xs'>
                      View Product
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
