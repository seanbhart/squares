import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const emojis = searchParams.get('emojis')
  
  const shareText = emojis
    ? encodeURIComponent(`Just squared my politics with @squares! ${emojis}\n\nTry it:`)
    : encodeURIComponent(`Just squared my politics with @squares!\n\nTry it:`)
  
  const embedUrl = encodeURIComponent('https://farcaster.squares.vote/miniapp?v=2')
  
  return redirect(
    `https://farcaster.xyz/~/compose?text=${shareText}&embeds[]=${embedUrl}`
  )
}
