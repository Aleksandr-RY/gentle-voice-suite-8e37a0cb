import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface HeroImage {
  id: string;
  image_url: string;
  sort_order: number;
}

const MAX_IMAGES = 3;

const HeroImageManager = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("hero_images")
      .select("*")
      .order("sort_order");
    if (data) setImages(data);
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= MAX_IMAGES) {
      toast.error(`Максимум ${MAX_IMAGES} фото`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("hero_images")
        .insert({ image_url: urlData.publicUrl, sort_order: images.length });
      if (insertError) throw insertError;

      toast.success("Фото загружено");
      fetchImages();
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (img: HeroImage) => {
    try {
      const urlParts = img.image_url.split("/site-images/");
      const filePath = urlParts[urlParts.length - 1];

      await supabase.storage.from("site-images").remove([filePath]);
      await supabase.from("hero_images").delete().eq("id", img.id);
      toast.success("Фото удалено");
      fetchImages();
    } catch (err: any) {
      toast.error(err.message || "Ошибка удаления");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-foreground">
          Фото на главной ({images.length}/{MAX_IMAGES})
        </h2>
        <Button
          size="sm"
          disabled={uploading || images.length >= MAX_IMAGES}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-1" />
          {uploading ? "Загрузка..." : "Добавить фото"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">Нет загруженных фото. Будет использовано фото по умолчанию.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
              <img
                src={img.image_url}
                alt="Hero"
                className="w-full aspect-[4/5] object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(img)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroImageManager;
