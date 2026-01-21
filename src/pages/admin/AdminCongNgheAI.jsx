import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    X,
    Save,
} from 'lucide-react';

const ITEMS_PER_TOOL_PAGE = 10;

// Dữ liệu mock các danh mục và công cụ AI
const initialCategories = [
    {
        id: "content",
        title: "🧠 Tạo nội dung",
        description: "AI giúp bạn viết, sáng tạo và giao tiếp hiệu quả hơn.",
        tools: [
            {
                name: "ChatGPT",
                link: "https://chat.openai.com/",
                desc: "Trợ lý AI thông minh từ OpenAI.",
                rating: 5,
                ratingCount: 1520,
            },
            {
                name: "Claude",
                link: "https://claude.ai/",
                desc: "AI hội thoại mạnh mẽ của Anthropic.",
                rating: 2,
                ratingCount: 20,
            },
            {
                name: "Notion AI",
                link: "https://www.notion.so/product/ai",
                desc: "Tự động tóm tắt và viết ghi chú.",
                rating: 4,
            },
            {
                name: "Jasper",
                link: "https://www.jasper.ai/",
                desc: "Viết bài marketing chuyên nghiệp.",
            },
            {
                name: "Copy.ai",
                link: "https://www.copy.ai/",
                desc: "Tạo nội dung quảng cáo nhanh chóng.",
            },
            {
                name: "Writesonic",
                link: "https://writesonic.com/",
                desc: "Tạo bài viết blog bằng AI.",
                rating: 1,
            },
            {
                name: "Rytr",
                link: "https://rytr.me/",
                desc: "Công cụ viết nhanh, dễ dùng.",
            },
            {
                name: "HyperWrite",
                link: "https://hyperwriteai.com/",
                desc: "AI viết email, blog, mô tả sản phẩm.",
            },
            {
                name: "Wordtune",
                link: "https://www.wordtune.com/",
                desc: "Gợi ý cách diễn đạt tốt hơn.",
            },
            {
                name: "SudoWrite",
                link: "https://www.sudowrite.com/",
                desc: "AI hỗ trợ viết tiểu thuyết sáng tạo.",
            },
            {
                name: "Anyword",
                link: "https://anyword.com/",
                desc: "Tối ưu nội dung cho quảng cáo.",
            },
            {
                name: "TextCortex",
                link: "https://textcortex.com/",
                desc: "AI viết tự nhiên, có extension trình duyệt.",
            },
            {
                name: "Writesphere",
                link: "https://writesphere.io/",
                desc: "AI cộng tác viết tài liệu nhóm.",
            },
            {
                name: "INK",
                link: "https://inkforall.com/",
                desc: "Tối ưu SEO và sáng tạo nội dung.",
            },
            {
                name: "AISEO",
                link: "https://aiseo.ai/",
                desc: "Công cụ viết chuẩn SEO tự động.",
            },
            {
                name: "GoCharlie",
                link: "https://www.gocharlie.ai/",
                desc: "Tạo bài viết đa nền tảng nhanh chóng.",
            },
            {
                name: "Scalenut",
                link: "https://www.scalenut.com/",
                desc: "Tạo bài blog dài chuẩn SEO.",
            },
            {
                name: "NeuralText",
                link: "https://neuraltext.com/",
                desc: "AI hỗ trợ nghiên cứu từ khóa và viết.",
            },
            {
                name: "Flowrite",
                link: "https://www.flowrite.com/",
                desc: "Tự động hoàn thiện email chuyên nghiệp.",
            },
            {
                name: "Compose AI",
                link: "https://www.compose.ai/",
                desc: "AI viết nhanh trong mọi ứng dụng.",
            },
        ],
    },
    {
        id: "image",
        title: "🎨 Tạo hình ảnh",
        description: "AI giúp bạn vẽ tranh, thiết kế và chỉnh sửa ảnh.",
        tools: [
            {
                name: "Midjourney",
                link: "https://www.midjourney.com/",
                desc: "Tạo ảnh nghệ thuật từ mô tả.",
            },
            {
                name: "DALL·E 3",
                link: "https://openai.com/dall-e-3",
                desc: "AI vẽ ảnh chính xác và giàu chi tiết.",
            },
            {
                name: "Leonardo AI",
                link: "https://leonardo.ai/",
                desc: "Tạo hình minh họa và concept art.",
            },
            {
                name: "Adobe Firefly",
                link: "https://firefly.adobe.com/",
                desc: "AI thiết kế của Adobe.",
            },
            {
                name: "Stable Diffusion",
                link: "https://stability.ai/",
                desc: "Tạo hình ảnh tự do bằng model mở.",
            },
            {
                name: "Fotor",
                link: "https://www.fotor.com/",
                desc: "Chỉnh sửa và nâng cấp ảnh bằng AI.",
            },
            {
                name: "RunDiffusion",
                link: "https://rundiffusion.com/",
                desc: "Render ảnh SD nhanh chóng.",
            },
            {
                name: "Playground AI",
                link: "https://playground.com/",
                desc: "Nền tảng tạo ảnh thân thiện.",
            },
            {
                name: "CF Spark",
                link: "https://www.creativefabrica.com/spark/",
                desc: "Tạo ảnh thiết kế sáng tạo.",
            },
            {
                name: "Scenario",
                link: "https://www.scenario.com/",
                desc: "Tạo asset game bằng AI.",
            },
            {
                name: "Mage.space",
                link: "https://www.mage.space/",
                desc: "Miễn phí tạo ảnh SD nhanh.",
            },
            {
                name: "Lexica",
                link: "https://lexica.art/",
                desc: "Kho ảnh AI và prompt cực mạnh.",
            },
            {
                name: "NightCafe",
                link: "https://creator.nightcafe.studio/",
                desc: "Trình tạo tranh AI dễ dùng.",
            },
            {
                name: "Dream by Wombo",
                link: "https://dream.ai/",
                desc: "Tạo tranh nghệ thuật nhanh chóng.",
            },
            {
                name: "Recraft",
                link: "https://www.recraft.ai/",
                desc: "Tạo icon và vector AI chất lượng cao.",
            },
            {
                name: "KREA",
                link: "https://www.krea.ai/",
                desc: "Tạo concept và UI mockup AI.",
            },
            {
                name: "Visions of Chaos",
                link: "https://softology.pro/",
                desc: "Phần mềm tạo fractal và AI art.",
            },
            {
                name: "Photopea",
                link: "https://www.photopea.com/",
                desc: "Photoshop online hỗ trợ AI.",
            },
            {
                name: "Gencraft",
                link: "https://gencraft.com/",
                desc: "Tạo hình minh họa theo phong cách tùy chỉnh.",
            },
            {
                name: "Huemint",
                link: "https://huemint.com/",
                desc: "AI phối màu tự động cho thiết kế.",
            },
        ],
    },
    {
        id: "video",
        title: "🎥 Tạo video",
        description:
            "AI giúp bạn dựng phim, tạo hoạt hình và video nhân vật ảo chuyên nghiệp.",
        tools: [
            {
                name: "Runway ML",
                link: "https://runwayml.com/",
                desc: "Tạo video và hiệu ứng AI chỉ với vài cú click.",
            },
            {
                name: "Pika Labs",
                link: "https://pika.art/",
                desc: "Tạo video từ mô tả văn bản cực nhanh.",
            },
            {
                name: "Synthesia",
                link: "https://www.synthesia.io/",
                desc: "Tạo nhân vật ảo nói chuyện tự nhiên.",
            },
            {
                name: "Kaiber",
                link: "https://www.kaiber.ai/",
                desc: "Chuyển ảnh thành video hoạt cảnh.",
            },
            {
                name: "Colossyan",
                link: "https://www.colossyan.com/",
                desc: "Tạo video giảng dạy bằng avatar AI.",
            },
            {
                name: "Animoto",
                link: "https://animoto.com/",
                desc: "Tạo video từ ảnh và clip ngắn.",
            },
            {
                name: "Descript",
                link: "https://www.descript.com/",
                desc: "Chỉnh sửa video như xử lý văn bản.",
            },
            {
                name: "Veed.io",
                link: "https://www.veed.io/",
                desc: "Trình dựng video trực tuyến kèm AI caption.",
            },
            {
                name: "Lumen5",
                link: "https://www.lumen5.com/",
                desc: "Chuyển bài viết thành video tự động.",
            },
            {
                name: "HeyGen",
                link: "https://www.heygen.com/",
                desc: "Tạo video avatar nhân vật thật.",
            },
            {
                name: "DeepBrain",
                link: "https://www.deepbrain.io/",
                desc: "Tạo video người nói từ văn bản.",
            },
            {
                name: "Rephrase.ai",
                link: "https://www.rephrase.ai/",
                desc: "Cá nhân hóa video marketing AI.",
            },
            {
                name: "Fliki",
                link: "https://fliki.ai/",
                desc: "Chuyển text thành video có giọng nói.",
            },
            {
                name: "Elai.io",
                link: "https://elai.io/",
                desc: "Tạo video hướng dẫn bằng avatar AI.",
            },
            {
                name: "Visla",
                link: "https://www.visla.us/",
                desc: "Tự động dựng video từ script.",
            },
            {
                name: "Genmo",
                link: "https://www.genmo.ai/",
                desc: "Tạo video hoạt hình sáng tạo từ prompt.",
            },
            {
                name: "Invideo AI",
                link: "https://invideo.io/",
                desc: "Tạo video marketing và social nhanh.",
            },
            {
                name: "Animaker",
                link: "https://www.animaker.com/",
                desc: "Dễ dàng dựng hoạt hình với AI.",
            },
            {
                name: "Runway Gen-2",
                link: "https://runwayml.com/",
                desc: "Tạo video từ ảnh hoặc text nâng cao.",
            },
            {
                name: "Synthesys",
                link: "https://synthesys.io/",
                desc: "Giải pháp video và voice AI chuyên nghiệp.",
            },
        ],
    },
    {
        id: "music",
        title: "🎵 Âm nhạc & Giọng nói",
        description: "AI giúp bạn tạo nhạc, phối âm và giả lập giọng người thật.",
        tools: [
            {
                name: "Suno",
                link: "https://suno.ai/",
                desc: "Tạo nhạc hoàn chỉnh từ lời mô tả.",
            },
            {
                name: "Mubert",
                link: "https://mubert.com/",
                desc: "Nhạc nền bản quyền AI cho video.",
            },
            {
                name: "Soundful",
                link: "https://soundful.com/",
                desc: "Tạo nhạc nền cho nội dung số.",
            },
            {
                name: "Aiva",
                link: "https://www.aiva.ai/",
                desc: "Trình soạn nhạc AI cho nhà sáng tạo.",
            },
            {
                name: "Boomy",
                link: "https://boomy.com/",
                desc: "Tạo và xuất bản nhạc nhanh.",
            },
            {
                name: "Beatoven",
                link: "https://www.beatoven.ai/",
                desc: "Tạo nhạc theo cảm xúc.",
            },
            {
                name: "LALAL.AI",
                link: "https://www.lalal.ai/",
                desc: "Tách giọng và nhạc nền bằng AI.",
            },
            {
                name: "Voicemod",
                link: "https://www.voicemod.net/",
                desc: "Giả giọng và mix voice thời gian thực.",
            },
            {
                name: "Soundraw",
                link: "https://soundraw.io/",
                desc: "AI sáng tác nhạc theo thể loại.",
            },
            {
                name: "Amper Music",
                link: "https://www.ampermusic.com/",
                desc: "Nhạc nền tự động cho phim và game.",
            },
            {
                name: "Loudly",
                link: "https://www.loudly.com/",
                desc: "Trình tạo nhạc điện tử AI.",
            },
            {
                name: "VocalRemover",
                link: "https://vocalremover.org/",
                desc: "Tách nhạc/giọng online nhanh chóng.",
            },
            {
                name: "HarmonAI",
                link: "https://www.harmonai.org/",
                desc: "Open-source tạo nhạc điện tử AI.",
            },
            {
                name: "Voice.ai",
                link: "https://voice.ai/",
                desc: "Chuyển đổi giọng nói sang người khác.",
            },
            {
                name: "ElevenLabs",
                link: "https://elevenlabs.io/",
                desc: "Tạo giọng đọc tự nhiên chân thật.",
            },
            {
                name: "Play.ht",
                link: "https://play.ht/",
                desc: "Chuyển văn bản thành giọng nói tự nhiên.",
            },
            {
                name: "Respeecher",
                link: "https://www.respeecher.com/",
                desc: "Clone giọng nói chuyên nghiệp.",
            },
            {
                name: "Musicfy",
                link: "https://www.musicfy.lol/",
                desc: "Tạo bài hát có lời bằng AI.",
            },
            {
                name: "AudioCraft",
                link: "https://ai.meta.com/blog/audiocraft-musicgen/",
                desc: "Model tạo nhạc của Meta.",
            },
            {
                name: "Splash Pro",
                link: "https://www.splashpro.ai/",
                desc: "Tạo beat nhạc tự động theo phong cách.",
            },
        ],
    },
    {
        id: "avatar",
        title: "🧍‍♂️ Tạo Avatar & Nhân vật ảo",
        description:
            "AI giúp bạn tạo avatar, gương mặt, nhân vật hoạt hình hoặc 3D sống động.",
        tools: [
            {
                name: "Ready Player Me",
                link: "https://readyplayer.me/",
                desc: "Tạo avatar 3D tương thích nhiều nền tảng.",
            },
            {
                name: "Artbreeder",
                link: "https://www.artbreeder.com/",
                desc: "Lai tạo gương mặt và nhân vật bằng AI.",
            },
            {
                name: "Toongineer Cartoonizer",
                link: "https://deepai.org/machine-learning-model/toongineer-cartoonizer",
                desc: "Chuyển ảnh thành avatar hoạt hình.",
            },
            {
                name: "Lensa AI",
                link: "https://prisma-ai.com/lensa",
                desc: "Tạo chân dung nghệ thuật AI cực đẹp.",
            },
            {
                name: "Avatarify",
                link: "https://avatarify.ai/",
                desc: "Tạo avatar động từ ảnh chân dung.",
            },
            {
                name: "SoulGen",
                link: "https://soulgen.ai/",
                desc: "Sinh nhân vật anime & realistic.",
            },
            {
                name: "Character.AI",
                link: "https://character.ai/",
                desc: "Trò chuyện với nhân vật AI có cá tính riêng.",
            },
            {
                name: "Reface",
                link: "https://hey.reface.ai/",
                desc: "Thay khuôn mặt trong video nhanh chóng.",
            },
            {
                name: "HeyGen Avatar",
                link: "https://www.heygen.com/avatar",
                desc: "Tạo avatar nói chuyện trong video.",
            },
            {
                name: "PhotoAI",
                link: "https://photoai.com/",
                desc: "Tạo avatar chuyên nghiệp từ bộ ảnh thật.",
            },
            {
                name: "Rosebud AI",
                link: "https://www.rosebud.ai/",
                desc: "Tạo model và nhân vật ảo cho marketing.",
            },
            {
                name: "Neural.love",
                link: "https://neural.love/",
                desc: "Tạo ảnh khuôn mặt chân thật bằng AI.",
            },
            {
                name: "Fotor Avatar Generator",
                link: "https://www.fotor.com/features/ai-avatar/",
                desc: "Tạo avatar nghệ thuật từ ảnh selfie.",
            },
            {
                name: "DeepFaceLab",
                link: "https://github.com/iperov/DeepFaceLab",
                desc: "Tạo deepfake và thay mặt chính xác.",
            },
            {
                name: "Moises Face Swap",
                link: "https://moises.ai/face-swap/",
                desc: "Thay khuôn mặt trong ảnh và video.",
            },
            {
                name: "Renderpeople",
                link: "https://renderpeople.com/",
                desc: "Cung cấp nhân vật 3D quét thật.",
            },
            {
                name: "Krikey AI",
                link: "https://www.krikey.ai/",
                desc: "Tạo avatar 3D và video hoạt hình từ text.",
            },
            {
                name: "DeepMotion Animate 3D",
                link: "https://www.deepmotion.com/",
                desc: "Biến video người thật thành nhân vật 3D chuyển động.",
            },
            {
                name: "Vroid Studio",
                link: "https://vroid.com/en/studio",
                desc: "Tạo nhân vật anime 3D cho game & video.",
            },
            {
                name: "Avatar SDK",
                link: "https://avatarsdk.com/",
                desc: "API tạo avatar 3D thời gian thực từ ảnh.",
            },
        ],
    },
    {
        id: "translate",
        title: "🌐 Dịch thuật & Ngôn ngữ",
        description: "AI giúp bạn dịch, học ngoại ngữ và giao tiếp toàn cầu.",
        tools: [
            {
                name: "DeepL",
                link: "https://www.deepl.com/",
                desc: "Công cụ dịch chính xác hơn Google Translate.",
            },
            {
                name: "Google Translate",
                link: "https://translate.google.com/",
                desc: "Dịch đa ngôn ngữ phổ biến nhất thế giới.",
            },
            {
                name: "ChatGPT Translator",
                link: "https://chat.openai.com/",
                desc: "Dịch ngữ cảnh, văn phong tự nhiên.",
            },
            {
                name: "Papago",
                link: "https://papago.naver.com/",
                desc: "AI dịch ngôn ngữ châu Á tốt nhất.",
            },
            {
                name: "Bing Translator",
                link: "https://www.bing.com/translator",
                desc: "Trình dịch nhanh từ Microsoft.",
            },
            {
                name: "Lingvanex",
                link: "https://lingvanex.com/",
                desc: "API dịch mạnh mẽ cho doanh nghiệp.",
            },
            {
                name: "Reverso",
                link: "https://www.reverso.net/",
                desc: "Dịch kèm ví dụ ngữ cảnh thực tế.",
            },
            {
                name: "iTranslate",
                link: "https://www.itranslate.com/",
                desc: "Ứng dụng dịch giọng nói & văn bản.",
            },
            {
                name: "LibreTranslate",
                link: "https://libretranslate.com/",
                desc: "Dịch mã nguồn mở miễn phí.",
            },
            {
                name: "SayHi Translate",
                link: "https://www.sayhi.com/",
                desc: "Dịch hội thoại trực tiếp bằng giọng.",
            },
            {
                name: "Translate.com",
                link: "https://www.translate.com/",
                desc: "Dịch nhanh và ghi âm giọng nói.",
            },
            {
                name: "Vocre",
                link: "https://www.vocre.com/",
                desc: "Dịch nói chuyện thời gian thực.",
            },
            {
                name: "LanguageTool",
                link: "https://languagetool.org/",
                desc: "Kiểm tra ngữ pháp và dịch song song.",
            },
            {
                name: "Smartcat",
                link: "https://www.smartcat.com/",
                desc: "Nền tảng dịch thuật cộng tác cho doanh nghiệp.",
            },
            {
                name: "POEditor",
                link: "https://poeditor.com/",
                desc: "Dịch phần mềm và app đa ngôn ngữ.",
            },
            {
                name: "TextCortex Translate",
                link: "https://textcortex.com/tools/ai-translator",
                desc: "Dịch văn bản có ngữ cảnh chuyên nghiệp.",
            },
            {
                name: "Elia",
                link: "https://www.eliatranslate.com/",
                desc: "Dịch tài liệu chuyên nghiệp có AI hiệu đính.",
            },
            {
                name: "DeepTranslate",
                link: "https://deeptranslate.com/",
                desc: "Dịch thuật ngữ chuyên ngành bằng AI.",
            },
            {
                name: "Veed Subtitles",
                link: "https://www.veed.io/",
                desc: "Tạo phụ đề và dịch video tự động.",
            },
            {
                name: "Unbabel",
                link: "https://unbabel.com/",
                desc: "Dịch kết hợp AI và biên tập viên người thật.",
            },
        ],
    },
    {
        id: "3d",
        title: "🧩 3D & Thiết kế mô hình",
        description:
            "Công cụ AI giúp tạo mô hình 3D, hoạt cảnh và vật thể kỹ thuật số nhanh chóng.",
        tools: [
            {
                name: "Luma AI",
                link: "https://lumalabs.ai/",
                desc: "Quét ảnh thành mô hình 3D bằng NeRF.",
            },
            {
                name: "Kaedim3D",
                link: "https://www.kaedim3d.com/",
                desc: "Chuyển concept 2D thành mô hình 3D.",
            },
            {
                name: "Scenario 3D",
                link: "https://www.scenario.com/",
                desc: "Tạo asset game và vật thể 3D.",
            },
            {
                name: "Spline AI",
                link: "https://spline.design/ai",
                desc: "Tạo scene 3D chỉ bằng mô tả văn bản.",
            },
            {
                name: "Mirage",
                link: "https://www.mirage-ai.com/",
                desc: "Tạo vật thể và texture 3D nhanh.",
            },
            {
                name: "Masterpiece Studio",
                link: "https://www.masterpiecestudio.com/",
                desc: "Tạo nhân vật 3D VR/AR dễ dàng.",
            },
            {
                name: "Plask",
                link: "https://plask.ai/",
                desc: "Tạo motion capture từ video.",
            },
            {
                name: "Nerfstudio",
                link: "https://nerf.studio/",
                desc: "Tái tạo cảnh 3D từ ảnh thật.",
            },
            {
                name: "Kinetix",
                link: "https://www.kinetix.tech/",
                desc: "Tạo animation nhân vật 3D không cần motion data.",
            },
            {
                name: "GET3D (NVIDIA)",
                link: "https://nv-tlabs.github.io/GET3D/",
                desc: "Sinh mô hình 3D bằng AI của NVIDIA.",
            },
            {
                name: "Skybox AI",
                link: "https://skybox.blockadelabs.com/",
                desc: "Tạo bầu trời và môi trường 3D 360°.",
            },
            {
                name: "Polycam",
                link: "https://poly.cam/",
                desc: "Quét và dựng mô hình 3D bằng camera điện thoại.",
            },
            {
                name: "Meshcapade",
                link: "https://meshcapade.com/",
                desc: "Tạo người ảo 3D phục vụ animation.",
            },
            {
                name: "ZEG AI",
                link: "https://www.zeg.ai/",
                desc: "Tạo ảnh sản phẩm 3D cho e-commerce.",
            },
            {
                name: "CGTrader",
                link: "https://www.cgtrader.com/",
                desc: "Kho và AI tạo mô hình 3D nhanh.",
            },
            {
                name: "Runway Gen-2 3D",
                link: "https://runwayml.com/",
                desc: "Tạo chuyển động 3D từ video 2D.",
            },
            {
                name: "Axiom AI",
                link: "https://axiom.ai/",
                desc: "Tạo mô phỏng và bố cục kỹ thuật 3D.",
            },
            {
                name: "InstaLOD",
                link: "https://instalod.com/",
                desc: "Tối ưu hóa mô hình 3D cho game và AR.",
            },
            {
                name: "Blockade Labs",
                link: "https://blockadelabs.com/",
                desc: "Tạo thế giới VR/3D từ prompt.",
            },
            {
                name: "Promethean AI",
                link: "https://prometheanai.com/",
                desc: "AI hỗ trợ dựng môi trường 3D tự động.",
            },
        ],
    },
    {
        id: "edu",
        title: "📘 Học tập & Giáo dục",
        description:
            "AI giúp bạn học hiệu quả, giảng dạy và tạo nội dung học tập tự động.",
        tools: [
            {
                name: "Khanmigo",
                link: "https://www.khanacademy.org/khan-labs",
                desc: "Trợ giảng AI của Khan Academy.",
            },
            {
                name: "Quizlet Q-Chat",
                link: "https://quizlet.com/",
                desc: "Trò chuyện học tập với AI theo flashcard.",
            },
            {
                name: "Perplexity AI",
                link: "https://www.perplexity.ai/",
                desc: "Công cụ hỏi đáp thông minh cho học tập.",
            },
            {
                name: "TutorAI",
                link: "https://tutorai.me/",
                desc: "AI tạo khóa học cá nhân hóa theo chủ đề bạn chọn.",
            },
            {
                name: "Coursera Coach",
                link: "https://www.coursera.org/",
                desc: "Trợ lý học tập tích hợp trong Coursera.",
            },
            {
                name: "StudyCrumb",
                link: "https://studycrumb.com/",
                desc: "AI viết luận và tạo outline cho sinh viên.",
            },
            {
                name: "Scholarcy",
                link: "https://www.scholarcy.com/",
                desc: "Tóm tắt tài liệu nghiên cứu nhanh.",
            },
            {
                name: "Explainpaper",
                link: "https://www.explainpaper.com/",
                desc: "Giải thích các bài nghiên cứu khoa học bằng AI.",
            },
            {
                name: "Elicit",
                link: "https://elicit.org/",
                desc: "Trợ lý AI giúp tìm và tổng hợp bài nghiên cứu.",
            },
            {
                name: "Edmodo AI",
                link: "https://new.edmodo.com/",
                desc: "Hỗ trợ giáo viên và học sinh tương tác thông minh.",
            },
            {
                name: "ChatGPT Edu",
                link: "https://openai.com/edu",
                desc: "Phiên bản giáo dục của ChatGPT cho trường học.",
            },
            {
                name: "Gradescope",
                link: "https://www.gradescope.com/",
                desc: "Chấm bài tự động bằng AI cho giáo viên.",
            },
            {
                name: "Notion Study AI",
                link: "https://www.notion.so/product/ai",
                desc: "Tóm tắt và gợi ý ghi chú học tập.",
            },
            {
                name: "Otter.ai",
                link: "https://otter.ai/",
                desc: "Ghi chú và tóm tắt bài giảng tự động.",
            },
            {
                name: "Socratic",
                link: "https://socratic.org/",
                desc: "Trả lời bài tập học sinh bằng AI của Google.",
            },
            {
                name: "Quizizz AI",
                link: "https://quizizz.com/",
                desc: "Tạo câu hỏi trắc nghiệm tự động.",
            },
            {
                name: "SlidesAI",
                link: "https://www.slidesai.io/",
                desc: "Tạo bài giảng và slide thuyết trình bằng AI.",
            },
            {
                name: "Jenni AI",
                link: "https://jenni.ai/",
                desc: "Viết tiểu luận và bài học có trích dẫn học thuật.",
            },
            {
                name: "Typewise Edu",
                link: "https://typewise.app/",
                desc: "AI giúp viết chính tả và ngữ pháp học thuật.",
            },
            {
                name: "Tome",
                link: "https://tome.app/",
                desc: "Tạo bài thuyết trình học tập bằng AI.",
            },
        ],
    },
    {
        id: "productivity",
        title: "💼 Năng suất & Văn phòng",
        description:
            "Công cụ AI giúp tự động hóa công việc, viết email, tạo báo cáo, quản lý thời gian, tóm tắt tài liệu, lịch họp,...",
        tools: [
            {
                name: "Notion AI",
                link: "https://www.notion.so/product/ai",
                desc: "Trợ lý AI trong Notion giúp viết, tóm tắt và lập kế hoạch.",
            },
            {
                name: "Jasper",
                link: "https://www.jasper.ai/",
                desc: "Công cụ viết nội dung marketing và email tự động bằng AI.",
            },
            {
                name: "ChatDOC",
                link: "https://chatdoc.com/",
                desc: "Trò chuyện với tài liệu PDF để tóm tắt và phân tích nhanh.",
            },
            {
                name: "Otter.ai",
                link: "https://otter.ai/",
                desc: "Ghi chú và tóm tắt cuộc họp bằng AI tự động.",
            },
            {
                name: "Superhuman AI",
                link: "https://superhuman.com/",
                desc: "Tự động hóa email và lịch làm việc thông minh.",
            },
            {
                name: "Motion",
                link: "https://www.usemotion.com/",
                desc: "Lên lịch và quản lý thời gian bằng AI.",
            },
            {
                name: "Fireflies.ai",
                link: "https://fireflies.ai/",
                desc: "Ghi âm và tóm tắt nội dung họp qua Zoom, Meet.",
            },
            {
                name: "Grammarly",
                link: "https://www.grammarly.com/",
                desc: "Kiểm tra chính tả, ngữ pháp và giọng văn bằng AI.",
            },
            {
                name: "Mem.ai",
                link: "https://mem.ai/",
                desc: "Ghi chú thông minh, gợi nhớ tự động và liên kết ý tưởng.",
            },
            {
                name: "Compose.ai",
                link: "https://www.compose.ai/",
                desc: "Viết email và tin nhắn nhanh bằng gợi ý AI.",
            },
            {
                name: "ClickUp Brain",
                link: "https://clickup.com/ai",
                desc: "Trợ lý viết và quản lý dự án tích hợp AI.",
            },
            {
                name: "Taskade AI",
                link: "https://taskade.com/",
                desc: "Tạo to-do list và kế hoạch nhóm bằng AI.",
            },
            {
                name: "Zapier AI",
                link: "https://zapier.com/ai",
                desc: "Tự động hóa quy trình công việc với AI.",
            },
            {
                name: "Notta",
                link: "https://www.notta.ai/",
                desc: "Chuyển giọng nói thành văn bản và tóm tắt nội dung.",
            },
            {
                name: "ChatGPT for Docs",
                link: "https://chatgpt.com/",
                desc: "Viết và chỉnh sửa tài liệu trực tiếp bằng ChatGPT.",
            },
            {
                name: "Tactiq",
                link: "https://tactiq.io/",
                desc: "Tạo bản ghi chú cuộc họp tự động từ Meet và Zoom.",
            },
            {
                name: "MeetGeek",
                link: "https://www.meetgeek.ai/",
                desc: "Tóm tắt, ghi chú và phân tích họp thông minh.",
            },
            {
                name: "Supernormal",
                link: "https://supernormal.com/",
                desc: "Ghi lại và tạo biên bản họp tự động.",
            },
            {
                name: "Krisp AI",
                link: "https://krisp.ai/",
                desc: "Khử tiếng ồn và ghi chú cuộc họp thông minh.",
            },
            {
                name: "Gamma App",
                link: "https://gamma.app/",
                desc: "Tạo slide trình bày tự động từ tài liệu.",
            },
        ],
    },

    {
        id: "programming",
        title: "🧮 Lập trình & Phát triển",
        description:
            "AI hỗ trợ code, debug, tạo API, viết tài liệu kỹ thuật, sinh giao diện web,...",
        tools: [
            {
                name: "GitHub Copilot",
                link: "https://github.com/features/copilot",
                desc: "AI gợi ý code theo thời gian thực.",
            },
            {
                name: "Replit Ghostwriter",
                link: "https://replit.com/",
                desc: "Viết và gợi ý mã thông minh trong Replit.",
            },
            {
                name: "Tabnine",
                link: "https://www.tabnine.com/",
                desc: "Tự động hoàn thành code với AI.",
            },
            {
                name: "Codeium",
                link: "https://www.codeium.com/",
                desc: "Trợ lý code miễn phí cho mọi IDE.",
            },
            {
                name: "Sourcegraph Cody",
                link: "https://about.sourcegraph.com/cody",
                desc: "AI giúp hiểu và tìm code trong dự án lớn.",
            },
            {
                name: "ChatGPT Code Interpreter",
                link: "https://chat.openai.com/",
                desc: "Phân tích dữ liệu và chạy mã trong ChatGPT.",
            },
            {
                name: "WindSurf",
                link: "https://windsurf.ai/",
                desc: "IDE AI giúp bạn lập trình bằng hội thoại.",
            },
            {
                name: "Mutable.ai",
                link: "https://mutable.ai/",
                desc: "Tạo tài liệu, test và refactor code tự động.",
            },
            {
                name: "CodeGeeX",
                link: "https://codegeex.cn/",
                desc: "AI hỗ trợ nhiều ngôn ngữ lập trình miễn phí.",
            },
            {
                name: "AskCodi",
                link: "https://askcodi.com/",
                desc: "Trợ lý viết code, test và doc tự động.",
            },
            {
                name: "Blackbox AI",
                link: "https://www.useblackbox.io/",
                desc: "Tìm và trích xuất code từ video, web và IDE.",
            },
            {
                name: "Pieces for Developers",
                link: "https://pieces.app/",
                desc: "Lưu trữ, gợi ý và tái sử dụng snippet code thông minh.",
            },
            {
                name: "Bloop",
                link: "https://bloop.ai/",
                desc: "Công cụ tìm kiếm code bằng ngôn ngữ tự nhiên.",
            },
            {
                name: "Cursor IDE",
                link: "https://cursor.sh/",
                desc: "Trình soạn thảo code hỗ trợ AI mạnh mẽ.",
            },
            {
                name: "Amazon CodeWhisperer",
                link: "https://aws.amazon.com/codewhisperer/",
                desc: "Trợ lý viết code của AWS.",
            },
            {
                name: "Phind",
                link: "https://phind.com/",
                desc: "Công cụ hỏi đáp về lập trình nhanh và chính xác.",
            },
            {
                name: "Bolt.new",
                link: "https://bolt.new/",
                desc: "Tạo ứng dụng web hoàn chỉnh chỉ bằng mô tả text.",
            },
            {
                name: "Vercel v0",
                link: "https://v0.dev/",
                desc: "Tạo giao diện web React tự động từ prompt.",
            },
            {
                name: "Anysphere",
                link: "https://anysphere.dev/",
                desc: "IDE thông minh giúp học và code nhanh hơn.",
            },
            {
                name: "CodeComplete",
                link: "https://codecomplete.ai/",
                desc: "AI hỗ trợ sinh code và gợi ý thông minh.",
            },
        ],
    },

    {
        id: "research",
        title: "🧠 Nghiên cứu & Phân tích",
        description: "Dành cho sinh viên, nhà nghiên cứu, nhà phân tích dữ liệu.",
        tools: [
            {
                name: "Elicit",
                link: "https://elicit.org/",
                desc: "AI giúp tìm và tổng hợp bài nghiên cứu.",
            },
            {
                name: "Scite.ai",
                link: "https://scite.ai/",
                desc: "Phân tích trích dẫn và độ tin cậy của bài nghiên cứu.",
            },
            {
                name: "ResearchRabbit",
                link: "https://www.researchrabbit.ai/",
                desc: "Khám phá mạng lưới tài liệu liên quan.",
            },
            {
                name: "Perplexity AI",
                link: "https://www.perplexity.ai/",
                desc: "Công cụ hỏi đáp có trích dẫn nguồn.",
            },
            {
                name: "Consensus",
                link: "https://consensus.app/",
                desc: "AI tổng hợp kết quả từ các bài nghiên cứu khoa học.",
            },
            {
                name: "Scholarcy",
                link: "https://www.scholarcy.com/",
                desc: "Tóm tắt bài nghiên cứu và trích dẫn tự động.",
            },
            {
                name: "Connected Papers",
                link: "https://www.connectedpapers.com/",
                desc: "Khám phá các bài nghiên cứu liên quan bằng đồ thị.",
            },
            {
                name: "Semantic Scholar",
                link: "https://www.semanticscholar.org/",
                desc: "Cơ sở dữ liệu học thuật lớn với AI hỗ trợ tìm kiếm.",
            },
            {
                name: "Paper Digest",
                link: "https://www.paper-digest.com/",
                desc: "Tóm tắt nhanh các bài nghiên cứu mới.",
            },
            {
                name: "Explainpaper",
                link: "https://www.explainpaper.com/",
                desc: "Giải thích bài nghiên cứu bằng ngôn ngữ dễ hiểu.",
            },
            {
                name: "Litmaps",
                link: "https://www.litmaps.com/",
                desc: "Tạo bản đồ kiến thức từ bài báo khoa học.",
            },
            {
                name: "Trinka AI",
                link: "https://www.trinka.ai/",
                desc: "Hiệu đính bài học thuật và kiểm tra ngữ pháp.",
            },
            {
                name: "Paperpile",
                link: "https://paperpile.com/",
                desc: "Quản lý tài liệu học thuật tiện lợi.",
            },
            {
                name: "Inciteful",
                link: "https://inciteful.xyz/",
                desc: "Khám phá các mối liên hệ nghiên cứu.",
            },
            {
                name: "ReadCube Papers",
                link: "https://www.readcube.com/",
                desc: "Quản lý và đọc bài báo khoa học hiệu quả.",
            },
            {
                name: "ChatPDF",
                link: "https://www.chatpdf.com/",
                desc: "Trò chuyện với file PDF nghiên cứu.",
            },
            {
                name: "Humata AI",
                link: "https://www.humata.ai/",
                desc: "Hiểu nội dung tài liệu dài bằng AI.",
            },
            {
                name: "ResearchGPT",
                link: "https://researchgpt.io/",
                desc: "AI tìm và tóm tắt nguồn nghiên cứu học thuật.",
            },
            {
                name: "ScholarGPT",
                link: "https://scholargpt.com/",
                desc: "Trợ lý học thuật chuyên biệt.",
            },
            {
                name: "SciSpace",
                link: "https://typeset.io/",
                desc: "Trình đọc và giải thích bài nghiên cứu bằng AI.",
            },
        ],
    },

    {
        id: "marketing",
        title: "📢 Marketing & Kinh doanh",
        description:
            "Hỗ trợ tạo nội dung quảng cáo, chiến dịch, email marketing, SEO,...",
        tools: [
            {
                name: "Copy.ai",
                link: "https://www.copy.ai/",
                desc: "Tạo nội dung quảng cáo và email tự động.",
            },
            {
                name: "Writesonic",
                link: "https://writesonic.com/",
                desc: "AI viết bài SEO và bài đăng mạng xã hội.",
            },
            {
                name: "Ocoya",
                link: "https://www.ocoya.com/",
                desc: "Lên lịch, viết và đăng bài mạng xã hội.",
            },
            {
                name: "Predis.ai",
                link: "https://predis.ai/",
                desc: "Tạo video, hình ảnh và bài đăng từ nội dung text.",
            },
            {
                name: "SurferSEO",
                link: "https://surferseo.com/",
                desc: "Phân tích và tối ưu bài viết chuẩn SEO.",
            },
            {
                name: "NeuronWriter",
                link: "https://neuronwriter.com/",
                desc: "Tối ưu nội dung theo từ khóa và đối thủ.",
            },
            {
                name: "Jasper",
                link: "https://www.jasper.ai/",
                desc: "AI viết nội dung marketing chuyên nghiệp.",
            },
            {
                name: "Anyword",
                link: "https://anyword.com/",
                desc: "Phân tích hiệu quả nội dung quảng cáo.",
            },
            {
                name: "Simplified",
                link: "https://simplified.com/",
                desc: "Tạo hình ảnh, video và caption cho marketing.",
            },
            {
                name: "AdCreative.ai",
                link: "https://www.adcreative.ai/",
                desc: "Tạo banner và quảng cáo tự động bằng AI.",
            },
            {
                name: "Smartwriter.ai",
                link: "https://www.smartwriter.ai/",
                desc: "Tạo email marketing cá nhân hóa.",
            },
            {
                name: "BrandCrowd AI",
                link: "https://www.brandcrowd.com/",
                desc: "Tạo logo thương hiệu tự động.",
            },
            {
                name: "Looka",
                link: "https://looka.com/",
                desc: "Tạo logo và nhận diện thương hiệu bằng AI.",
            },
            {
                name: "Copysmith",
                link: "https://copysmith.ai/",
                desc: "Sinh nội dung quảng cáo tự động.",
            },
            {
                name: "ContentBot",
                link: "https://contentbot.ai/",
                desc: "AI viết blog và nội dung sản phẩm nhanh.",
            },
            {
                name: "Ink for All",
                link: "https://inkforall.com/",
                desc: "Tối ưu nội dung SEO và sáng tạo AI.",
            },
            {
                name: "Postwise",
                link: "https://postwise.ai/",
                desc: "Tạo bài đăng Twitter và LinkedIn tự động.",
            },
            {
                name: "Clickable",
                link: "https://clickable.so/",
                desc: "Sinh video quảng cáo từ nội dung text.",
            },
            {
                name: "Creaitor.ai",
                link: "https://creaitor.ai/",
                desc: "AI viết nội dung cho thương hiệu của bạn.",
            },
            {
                name: "Phrasee",
                link: "https://phrasee.co/",
                desc: "Tối ưu ngôn ngữ quảng cáo và email bằng AI.",
            },
        ],
    },
    {
        id: "entertainment",
        title: "🎮 Giải trí & Sáng tạo tự do",
        description:
            "Ứng dụng AI cho game, truyện, thơ, meme, roleplay, ý tưởng sáng tạo.",
        tools: [
            {
                name: "Character.ai",
                link: "https://character.ai/",
                desc: "Trò chuyện với nhân vật ảo bằng AI.",
            },
            {
                name: "NovelAI",
                link: "https://novelai.net/",
                desc: "Viết truyện, mô phỏng nhân vật và thế giới ảo.",
            },
            {
                name: "Sudowrite",
                link: "https://www.sudowrite.com/",
                desc: "AI viết sáng tạo và gợi ý phong cách văn học.",
            },
            {
                name: "ChatFAI",
                link: "https://chatfai.com/",
                desc: "Trò chuyện roleplay với nhân vật yêu thích.",
            },
            {
                name: "Scenario",
                link: "https://www.scenario.com/",
                desc: "Tạo hình ảnh nhân vật và bối cảnh game.",
            },
            {
                name: "Artbreeder",
                link: "https://www.artbreeder.com/",
                desc: "Lai tạo hình ảnh nhân vật và phong cảnh 3D.",
            },
            {
                name: "StoryWizard",
                link: "https://www.storywizard.ai/",
                desc: "Tạo truyện tranh và truyện ngắn tự động.",
            },
            {
                name: "AI Dungeon",
                link: "https://play.aidungeon.io/",
                desc: "Trò chơi tương tác với cốt truyện do AI điều khiển.",
            },
            {
                name: "Dreamily",
                link: "https://dreamily.ai/",
                desc: "Công cụ viết truyện tự động bằng AI.",
            },
            {
                name: "MemeCam",
                link: "https://memecam.ai/",
                desc: "Tạo meme tự động từ ảnh và văn bản.",
            },
            {
                name: "Kaiber",
                link: "https://kaiber.ai/",
                desc: "Tạo video âm nhạc và hoạt hình từ ý tưởng.",
            },
            {
                name: "Runway ML",
                link: "https://runwayml.com/",
                desc: "Công cụ video AI chuyên nghiệp cho sáng tạo.",
            },
            {
                name: "Genmo",
                link: "https://genmo.ai/",
                desc: "Tạo video hoạt hình từ văn bản.",
            },
            {
                name: "Soundraw",
                link: "https://soundraw.io/",
                desc: "Sáng tác nhạc tự động bằng AI.",
            },
            {
                name: "Beatoven.ai",
                link: "https://beatoven.ai/",
                desc: "Tạo nhạc nền theo cảm xúc video.",
            },
            {
                name: "Boomy",
                link: "https://boomy.com/",
                desc: "Sáng tác bài hát trong vài phút.",
            },
            {
                name: "Voicemod",
                link: "https://www.voicemod.net/",
                desc: "Tạo và chỉnh giọng nói AI.",
            },
            {
                name: "Reface",
                link: "https://reface.ai/",
                desc: "Thay đổi khuôn mặt trong video bằng AI.",
            },
            {
                name: "Papercup",
                link: "https://www.papercup.com/",
                desc: "Lồng tiếng video tự động bằng AI.",
            },
            {
                name: "DeepDreamGenerator",
                link: "https://deepdreamgenerator.com/",
                desc: "Tạo ảnh nghệ thuật phong cách trừu tượng bằng AI.",
            },
        ],
    },
];

// Màn hình quản trị danh mục & công cụ Công nghệ AI
const AdminCongNgheAI = () => {
    const [categories, setCategories] = useState(initialCategories || []);
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategories[0]?.id || '');
    const [toolCurrentPage, setToolCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingTool, setIsAddingTool] = useState(false);
    const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
    const [editingToolIndex, setEditingToolIndex] = useState(null);

    const [categoryForm, setCategoryForm] = useState({ id: '', title: '', description: '' });
    const [toolForm, setToolForm] = useState({ name: '', link: '', desc: '', rating: '', ratingCount: '' });

    const dropdownRef = useRef(null);

    // Danh mục hiện tại
    const currentCategory = categories.find(cat => cat.id === selectedCategoryId);

    // Lọc danh mục cho dropdown
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories;
        return categories.filter(cat =>
            cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectCategory = (catId) => {
        setSelectedCategoryId(catId);
        setSearchTerm('');
        setIsDropdownOpen(false);
        setToolCurrentPage(1); // Reset về trang 1 khi đổi danh mục
    };

    const openCategoryModal = (index = null) => {
        if (index !== null) {
            const cat = categories[index];
            setCategoryForm({ id: cat.id, title: cat.title, description: cat.description });
            setEditingCategoryIndex(index);
        } else {
            setCategoryForm({ id: '', title: '', description: '' });
            setEditingCategoryIndex(null);
        }
        setIsAddingCategory(true);
    };

    const openToolModal = (toolIndex = null) => {
        if (toolIndex !== null && currentCategory) {
            const tool = currentCategory.tools[toolIndex];
            setToolForm({
                name: tool.name,
                link: tool.link,
                desc: tool.desc,
                rating: tool.rating?.toString() || '',
                ratingCount: tool.ratingCount?.toString() || '',
            });
            setEditingToolIndex(toolIndex);
        } else {
            setToolForm({ name: '', link: '', desc: '', rating: '', ratingCount: '' });
            setEditingToolIndex(null);
        }
        setIsAddingTool(true);
    };

    // === BẮT BUỘC TẤT CẢ TRƯỜNG DANH MỤC ===
    const handleSaveCategory = () => {
        if (!categoryForm.id.trim()) {
            toast.error('Vui lòng nhập ID danh mục!');
            return;
        }
        if (!categoryForm.title.trim()) {
            toast.error('Vui lòng nhập Tiêu đề!');
            return;
        }
        if (!categoryForm.description.trim()) {
            toast.error('Vui lòng nhập Mô tả!');
            return;
        }

        let updated = [...categories];

        if (editingCategoryIndex !== null) {
            updated[editingCategoryIndex] = { ...categoryForm, tools: updated[editingCategoryIndex].tools };
            toast.success('Cập nhật danh mục thành công!');
            if (selectedCategoryId === categories[editingCategoryIndex].id) {
                setSelectedCategoryId(categoryForm.id);
            }
        } else {
            const newCat = { ...categoryForm, tools: [] };
            updated.push(newCat);
            toast.success('Thêm danh mục mới thành công!');
            setSelectedCategoryId(newCat.id);
        }

        setCategories(updated);
        setIsAddingCategory(false);
    };

    // === BẮT BUỘC TẤT CẢ TRƯỜNG CÔNG CỤ ===
    const handleSaveTool = () => {
        if (!toolForm.name.trim()) {
            toast.error('Vui lòng nhập Tên công cụ!');
            return;
        }
        if (!toolForm.link.trim()) {
            toast.error('Vui lòng nhập Link!');
            return;
        }
        if (!toolForm.desc.trim()) {
            toast.error('Vui lòng nhập Mô tả!');
            return;
        }
        if (!toolForm.rating.trim()) {
            toast.error('Vui lòng nhập Đánh giá!');
            return;
        }
        if (!toolForm.ratingCount.trim()) {
            toast.error('Vui lòng nhập Số đánh giá!');
            return;
        }

        const newTool = {
            name: toolForm.name.trim(),
            link: toolForm.link.trim(),
            desc: toolForm.desc.trim(),
            rating: toolForm.rating ? parseFloat(toolForm.rating) : undefined,
            ratingCount: toolForm.ratingCount ? parseInt(toolForm.ratingCount) : undefined,
        };

        const updated = [...categories];
        const catIndex = categories.findIndex(cat => cat.id === selectedCategoryId);

        if (catIndex === -1) {
            toast.error('Không tìm thấy danh mục!');
            return;
        }

        if (editingToolIndex !== null) {
            updated[catIndex].tools[editingToolIndex] = newTool;
            toast.success('Cập nhật công cụ thành công!');
        } else {
            updated[catIndex].tools.push(newTool);
            toast.success('Thêm công cụ mới thành công!');
        }

        setCategories(updated);
        setIsAddingTool(false);
        setEditingToolIndex(null);

        // Chuyển đến trang cuối nếu thêm mới
        if (editingToolIndex === null) {
            const newTotalPages = Math.ceil(updated[catIndex].tools.length / ITEMS_PER_TOOL_PAGE);
            setToolCurrentPage(newTotalPages);
            return;
        }
    };

    const handleDeleteCategory = (index) => {
        if (window.confirm('Xóa danh mục này sẽ xóa toàn bộ công cụ bên trong. Bạn có chắc?')) {
            const deletedId = categories[index].id;
            const newCategories = categories.filter((_, i) => i !== index);
            setCategories(newCategories);
            toast.success('Xóa danh mục thành công!');
            if (selectedCategoryId === deletedId) {
                setSelectedCategoryId(newCategories[0]?.id || '');
                setToolCurrentPage(1);
            }
        }
    };

    const handleDeleteTool = (toolIndex) => {
        if (window.confirm('Bạn có chắc muốn xóa công cụ này?')) {
            const updated = [...categories];
            const catIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
            updated[catIndex].tools.splice(toolIndex, 1);
            setCategories(updated);
            toast.success('Xóa công cụ thành công!');
        }
    };

    // Phân trang công cụ (bây giờ đã hoạt động)
    const currentTools = currentCategory?.tools || [];
    const totalToolPages = Math.ceil(currentTools.length / ITEMS_PER_TOOL_PAGE);
    const displayedTools = currentTools.slice(
        (toolCurrentPage - 1) * ITEMS_PER_TOOL_PAGE,
        toolCurrentPage * ITEMS_PER_TOOL_PAGE
    );

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Quản Lý Công Nghệ AI</h1>

                    {/* Toolbar chọn danh mục */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full lg:max-w-lg" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-blue-500 transition"
                                >
                                    <span className={currentCategory ? "text-gray-900" : "text-gray-400"}>
                                        {currentCategory ? currentCategory.title : "Chọn danh mục..."}
                                    </span>
                                    {isDropdownOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>

                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />

                                {isDropdownOpen && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm danh mục..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="absolute inset-x-0 top-full mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-lg z-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                        <div className="absolute top-full mt-16 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleSelectCategory(cat.id)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition flex justify-between items-center ${cat.id === selectedCategoryId ? 'bg-blue-50 font-medium' : ''}`}
                                                    >
                                                        <div>
                                                            <div className="font-medium">{cat.title}</div>
                                                            <div className="text-xs text-gray-500">{cat.tools.length} công cụ</div>
                                                        </div>
                                                        {cat.id === selectedCategoryId && <span className="text-blue-600 text-sm">✓</span>}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-gray-500">Không tìm thấy danh mục</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => openCategoryModal()}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm danh mục mới
                            </button>
                        </div>
                    </div>

                    {/* Hiển thị danh mục hiện tại */}
                    {currentCategory ? (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-5 flex items-center justify-between border-b">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{currentCategory.title}</h2>
                                    <p className="text-gray-600 mt-1">{currentCategory.description}</p>
                                    <p className="text-sm text-gray-500 mt-2">Tổng: {currentCategory.tools.length} công cụ</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => openCategoryModal(categories.findIndex(c => c.id === selectedCategoryId))}
                                        className="text-blue-600 hover:text-blue-800">
                                        <Edit2 className="w-6 h-6" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(categories.findIndex(c => c.id === selectedCategoryId))}
                                        className="text-red-600 hover:text-red-800">
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                    <button onClick={() => openToolModal()}
                                        className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition text-sm font-medium">
                                        + Thêm công cụ
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Tên công cụ</th>
                                            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                            <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                                            <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase">Link</th>
                                            <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {displayedTools.map((tool, idx) => {
                                            const globalIndex = (toolCurrentPage - 1) * ITEMS_PER_TOOL_PAGE + idx;
                                            return (
                                                <tr key={globalIndex} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tool.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-lg">{tool.desc}</td>
                                                    <td className="px-6 py-4 text-center text-sm">
                                                        {tool.rating ? `${tool.rating} ⭐ (${tool.ratingCount || 0})` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <a href={tool.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                            Xem
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-4">
                                                            <button onClick={() => openToolModal(globalIndex)} className="text-blue-600 hover:text-blue-800">
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                            <button onClick={() => handleDeleteTool(globalIndex)} className="text-red-600 hover:text-red-800">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination - BÂY GIỜ HOẠT ĐỘNG */}
                            {totalToolPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {(toolCurrentPage - 1) * ITEMS_PER_TOOL_PAGE + 1} - {Math.min(toolCurrentPage * ITEMS_PER_TOOL_PAGE, currentTools.length)} / {currentTools.length}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setToolCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={toolCurrentPage === 1}
                                            className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium">
                                            Trang {toolCurrentPage} / {totalToolPages}
                                        </span>
                                        <button
                                            onClick={() => setToolCurrentPage(p => Math.min(p + 1, totalToolPages))}
                                            disabled={toolCurrentPage === totalToolPages}
                                            className="px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <p className="text-gray-500 text-lg">Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!</p>
                        </div>
                    )}

                    {/* Modal Danh mục - BẮT BUỘC TẤT CẢ TRƯỜNG */}
                    {isAddingCategory && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h2 className="text-2xl font-bold">{editingCategoryIndex !== null ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                                    <button onClick={() => setIsAddingCategory(false)}><X className="w-7 h-7" /></button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ID danh mục <span className="text-red-500">*</span></label>
                                        <input value={categoryForm.id} onChange={e => setCategoryForm({ ...categoryForm, id: e.target.value })} placeholder="content" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                                        <input value={categoryForm.title} onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả <span className="text-red-500">*</span></label>
                                        <textarea rows={3} value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 p-6 border-t">
                                    <button onClick={() => setIsAddingCategory(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-100">Hủy</button>
                                    <button onClick={handleSaveCategory} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                        <Save className="w-5 h-5" /> {editingCategoryIndex !== null ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Công cụ - BẮT BUỘC TẤT CẢ TRƯỜNG */}
                    {isAddingTool && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h2 className="text-2xl font-bold">{editingToolIndex !== null ? 'Sửa công cụ' : 'Thêm công cụ mới'}</h2>
                                    <button onClick={() => setIsAddingTool(false)}><X className="w-7 h-7" /></button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên công cụ <span className="text-red-500">*</span></label>
                                        <input value={toolForm.name} onChange={e => setToolForm({ ...toolForm, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Link <span className="text-red-500">*</span></label>
                                        <input value={toolForm.link} onChange={e => setToolForm({ ...toolForm, link: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả <span className="text-red-500">*</span></label>
                                        <textarea rows={4} value={toolForm.desc} onChange={e => setToolForm({ ...toolForm, desc: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (sao) <span className="text-red-500">*</span></label>
                                            <input type="number" min="0" max="5" value={toolForm.rating} onChange={e => setToolForm({ ...toolForm, rating: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượt đánh giá <span className="text-red-500">*</span></label>
                                            <input type="number" min="0" value={toolForm.ratingCount} onChange={e => setToolForm({ ...toolForm, ratingCount: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 p-6 border-t">
                                    <button onClick={() => setIsAddingTool(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-100">Hủy</button>
                                    <button onClick={handleSaveTool} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                        <Save className="w-5 h-5" /> {editingToolIndex !== null ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminCongNgheAI;