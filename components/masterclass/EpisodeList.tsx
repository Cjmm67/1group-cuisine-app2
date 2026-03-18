import React from 'react';
import { Episode } from '@/types/index';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTime } from '@/lib/utils';
import { Play } from 'lucide-react';

interface EpisodeListProps {
  episodes: Episode[];
}

export const EpisodeList: React.FC<EpisodeListProps> = ({ episodes }) => {
  const sortedEpisodes = [...episodes].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedEpisodes.map((episode) => (
        <Card key={episode.id}>
          <CardContent className="py-4">
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-gradient-to-br from-gold-100 to-gold-50 rounded flex items-center justify-center flex-shrink-0">
                <Play size={32} className="text-gold-600 fill-gold-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-charcoal-800">
                      Episode {episode.order}: {episode.title}
                    </h3>
                    <p className="text-sm text-charcoal-600 mt-1">{episode.description}</p>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {formatTime(episode.duration)}
                  </Badge>
                </div>

                {episode.relatedRecipeIds && episode.relatedRecipeIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-charcoal-600 mb-2">Related recipes:</p>
                    <div className="flex flex-wrap gap-1">
                      {episode.relatedRecipeIds.map((recipeId) => (
                        <Badge key={recipeId} variant="info" size="sm">
                          Recipe #{recipeId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
