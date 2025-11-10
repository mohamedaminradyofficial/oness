import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ContentData {
  url: string;
  title: string;
  mainContent: string;
  codeBlocks: string[];
  hasCode: boolean;
  author: string;
  date: string;
}

export async function getWebsiteTextContent(url: string): Promise<string> {
  /**
   * Extract main text content from a website URL
   * Uses basic HTML parsing since trafilatura equivalent may need additional setup
   */
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Remove scripts and styles
    $('script, style, nav, header, footer, aside').remove();

    // Extract text content
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return text;
  } catch (error) {
    throw new Error(`Failed to extract content: ${error.message}`);
  }
}

export async function extractContentFromUrl(url: string): Promise<ContentData> {
  /**
   * Extract comprehensive content from any URL
   * Supports text, articles, scientific posts
   */
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove scripts and styles
    $('script, style').remove();

    // Extract main text content
    const mainText = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract code blocks
    const codeBlocks: string[] = [];
    $('code, pre').each((_, element) => {
      const codeText = $(element).text().trim();
      if (codeText) {
        codeBlocks.push(codeText);
      }
    });

    // Extract title
    let title = '';
    const titleElement = $('title').first();
    if (titleElement.length > 0) {
      title = titleElement.text().trim();
    }

    // Extract meta information
    let author = '';
    let date = '';

    // Try to find author in meta tags
    const authorMeta = $('meta[name="author"]').attr('content') ||
                       $('meta[property="article:author"]').attr('content');
    if (authorMeta) {
      author = authorMeta;
    }

    // Try to find date in meta tags
    const dateMeta = $('meta[name="publish-date"]').attr('content') ||
                     $('meta[property="article:published_time"]').attr('content') ||
                     $('time').attr('datetime') ||
                     $('time').first().text().trim();
    if (dateMeta) {
      date = dateMeta;
    }

    return {
      url,
      title,
      mainContent: mainText,
      codeBlocks,
      hasCode: codeBlocks.length > 0,
      author,
      date
    };

  } catch (error) {
    throw new Error(`خطأ في استخراج المحتوى: ${error.message}`);
  }
}

export function isValidUrl(url: string): boolean {
  /**
   * Validate URL format
   */
  const urlPattern = /^https?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;
  return urlPattern.test(url);
}
