export interface FoodSearchResult {
  name: string;
  servingSize: string;
  calories: number;
}

interface OffProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: {
    "energy-kcal_serving"?: number;
    "energy-kcal_100g"?: number;
  };
}

interface OffSearchResponse {
  products: OffProduct[];
}

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const params = new URLSearchParams({
    search_terms: query,
    json: "1",
    fields: "product_name,brands,serving_size,nutriments",
    page_size: "20",
  });

  const res = await fetch(
    `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  const data: OffSearchResponse = await res.json();

  return data.products
    .filter((p) => p.product_name)
    .map((p) => {
      const name = [p.product_name, p.brands].filter(Boolean).join(" - ");
      const calories = Math.round(
        p.nutriments?.["energy-kcal_serving"] ??
          p.nutriments?.["energy-kcal_100g"] ??
          0,
      );
      return {
        name,
        servingSize: p.serving_size ?? "100g",
        calories,
      };
    });
}
