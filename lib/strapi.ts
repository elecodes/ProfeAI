import { get } from "http";

const BASE_URL = 'http://localhost:1337';

export async function getStrapiData(url: string) {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    const data = await response.json();
    return data
}catch (error) {
    console.error('Error fetching data:', error);
    return null
  }
}
