# Self-Hosting

Since NovaChat doesn't rely on a backend, it can be easily self-hosted.

## Running Locally

> Local requirements: Node.js 20 + pnpm 9

```sh
git clone https://github.com/rxliuli/novachat.git
pnpm i
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to access it.

## Deploying Remotely

### Using Cloudflare Pages

1. Build static assets locally with `pnpm build`
2. [Register for a Cloudflare account](https://dash.cloudflare.com/sign-up)
3. Navigate to **Workers & Pages > Overview > Create an application > Pages**, and select **Upload assets**
   ![self-host-1](/images/self-host-1.png)
4. Enter a project name and create it
   ![self-host-2](/images/self-host-2.png)
5. Drag and drop the `dist` directory to upload
   ![self-host-3](/images/self-host-3.png)
6. Now, you've successfully deployed to Cloudflare Pages
   ![self-host-4](/images/self-host-4.png)
