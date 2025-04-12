import type {NextConfig} from 'next';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
              to: 'public/pdf.worker.min.js',
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
