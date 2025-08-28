-- Delete all resume files from Supabase storage
DELETE FROM storage.objects 
WHERE bucket_id = 'resumes';