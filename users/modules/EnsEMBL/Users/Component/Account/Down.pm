=head1 LICENSE

Copyright [1999-2015] Wellcome Trust Sanger Institute and the EMBL-European Bioinformatics Institute

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

=cut

package EnsEMBL::Users::Component::Account::Down;

### Component to display messages to user if userdb is down
### @author hr5

use strict;
use warnings;

use parent qw(EnsEMBL::Users::Component::Account);

sub content {
  my $self = shift;

  return sprintf
    '<div class="info">
      <h3>User accounts not available</h3>
      <div class="message-pad"><p>%s user accounts feature is temporarily not available due to unavailability of users database.</p></div>
    </div>', $self->hub->species_defs->ENSEMBL_SITETYPE
  ;
}

1;